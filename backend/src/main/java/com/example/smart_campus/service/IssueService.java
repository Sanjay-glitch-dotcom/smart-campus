package com.example.smart_campus.service;

import com.example.smart_campus.dto.IssueRequest;
import com.example.smart_campus.dto.IssueResponse;
import com.example.smart_campus.dto.IssueHistoryResponse;
import com.example.smart_campus.model.*;
import com.example.smart_campus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final IssuePhotoRepository issuePhotoRepository;
    private final IssueUpvoteRepository issueUpvoteRepository;
    private final IssueHistoryRepository issueHistoryRepository;

    // ── Create ────────────────────────────────────────────
    @Transactional
    public IssueResponse createIssue(IssueRequest request, String email) {
        User user = findUserByEmail(email);

        Issue issue = Issue.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .location(request.getLocation())
                .reportedBy(user)
                .status(Issue.Status.OPEN)
                .build();

        Issue saved = issueRepository.save(issue);

        // Save photos if provided
        if (request.getPhotoUrls() != null && !request.getPhotoUrls().isEmpty()) {
            for (String photoUrl : request.getPhotoUrls()) {
                IssuePhoto photo = IssuePhoto.builder()
                        .issue(saved)
                        .photoUrl(photoUrl)
                        .build();
                issuePhotoRepository.save(photo);
            }
        }

        // Create history entry
        createHistoryEntry(saved, user, null, Issue.Status.OPEN, "Issue created");

        try {
            emailService.sendIssueConfirmation(user.getEmail(), saved);
        } catch (Exception e) {
            System.err.println("Email notification failed (non-fatal): " + e.getMessage());
        }

        return mapToResponse(saved, email);
    }

    // ── Read: My Issues ───────────────────────────────────
    @Transactional(readOnly = true)
    public List<IssueResponse> getMyIssues(String email) {
        User user = findUserByEmail(email);
        return issueRepository
                .findByReportedBy(user)
                .stream()
                .map(issue -> mapToResponse(issue, email))
                .toList();
    }

    // ── Read: Single ──────────────────────────────────────
    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Long id, String email) {
        Issue issue = findIssueById(id);
        return mapToResponse(issue, email);
    }

    // ── Read: All ─────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<IssueResponse> getAllIssues(String email) {
        return issueRepository.findAll()
                .stream()
                .map(issue -> mapToResponse(issue, email))
                .toList();
    }

    // ── Update: Content ───────────────────────────────────
    @Transactional
    public IssueResponse updateIssue(Long id, IssueRequest request, String email) {
        Issue issue = findIssueById(id);
        User caller = findUserByEmail(email);

        boolean isPrivileged = caller.getRole() == User.Role.ADMIN
                || caller.getRole() == User.Role.DEPARTMENT_HEAD;

        if (!isPrivileged) {
            if (!issue.getReportedBy().getEmail().equals(email)) {
                throw new RuntimeException("You can only update your own issues");
            }
            if (issue.getStatus() != Issue.Status.OPEN) {
                throw new RuntimeException("Only OPEN issues can be edited");
            }
        }

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(request.getCategory());
        issue.setPriority(request.getPriority());
        issue.setLocation(request.getLocation());
        issue.setUpdatedAt(LocalDateTime.now());

        // Update photos
        if (request.getPhotoUrls() != null) {
            // Remove existing photos
            issuePhotoRepository.deleteByIssueId(id);
            
            // Add new photos
            for (String photoUrl : request.getPhotoUrls()) {
                IssuePhoto photo = IssuePhoto.builder()
                        .issue(issue)
                        .photoUrl(photoUrl)
                        .build();
                issuePhotoRepository.save(photo);
            }
        }

        return mapToResponse(issueRepository.save(issue), email);
    }

    // ── Update: Status ────────────────────────────────────
    @Transactional
    public IssueResponse updateStatus(Long id, Issue.Status status, String email) {
        Issue issue = findIssueById(id);
        User caller = findUserByEmail(email);
        
        Issue.Status fromStatus = issue.getStatus();
        issue.setStatus(status);
        issue.setUpdatedAt(LocalDateTime.now());

        if (status == Issue.Status.RESOLVED) {
            issue.setResolvedAt(LocalDateTime.now());
        }

        // Create history entry
        createHistoryEntry(issue, caller, fromStatus, status, "Status updated");

        Issue saved = issueRepository.save(issue);

        try {
            emailService.sendStatusUpdate(saved.getReportedBy().getEmail(), saved);
        } catch (Exception e) {
            System.err.println("Email notification failed (non-fatal): " + e.getMessage());
        }

        return mapToResponse(saved, email);
    }

    // ── Upvote System ─────────────────────────────────────
    @Transactional
    public void toggleUpvote(Long issueId, String email) {
        Issue issue = findIssueById(issueId);
        User user = findUserByEmail(email);

        // Check if user already upvoted
        var existingUpvote = issueUpvoteRepository.findByIssueIdAndUserId(issueId, user.getId());
        
        if (existingUpvote.isPresent()) {
            // Remove upvote
            issueUpvoteRepository.deleteByIssueIdAndUserId(issueId, user.getId());
        } else {
            // Add upvote
            IssueUpvote upvote = IssueUpvote.builder()
                    .issue(issue)
                    .user(user)
                    .build();
            issueUpvoteRepository.save(upvote);
        }
    }

    // ── Delete ────────────────────────────────────────────
    @Transactional
    public void deleteIssue(Long id, String email) {
        Issue issue = findIssueById(id);
        User caller = findUserByEmail(email);

        boolean isAdmin = caller.getRole() == User.Role.ADMIN;

        if (!isAdmin) {
            if (!issue.getReportedBy().getEmail().equals(email)) {
                throw new RuntimeException("You can only delete your own issues");
            }
            if (issue.getStatus() != Issue.Status.OPEN) {
                throw new RuntimeException("Only OPEN issues can be deleted");
            }
        }

        issueRepository.deleteById(id);
    }

    // ── Private Helpers ───────────────────────────────────
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private Issue findIssueById(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));
    }

    private void createHistoryEntry(Issue issue, User changedBy, Issue.Status fromStatus, 
                                  Issue.Status toStatus, String comment) {
        IssueHistory history = IssueHistory.builder()
                .issue(issue)
                .changedBy(changedBy)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .comment(comment)
                .build();
        issueHistoryRepository.save(history);
    }

    private IssueResponse mapToResponse(Issue issue, String currentUserEmail) {
        // Get photos
        List<String> photoUrls = issuePhotoRepository.findByIssueId(issue.getId())
                .stream()
                .map(IssuePhoto::getPhotoUrl)
                .collect(Collectors.toList());

        // Get upvote count
        long upvoteCount = issueUpvoteRepository.countByIssueId(issue.getId());

        // Check if current user has upvoted
        boolean hasUpvoted = false;
        if (currentUserEmail != null) {
            User currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
            if (currentUser != null) {
                hasUpvoted = issueUpvoteRepository.findByIssueIdAndUserId(issue.getId(), currentUser.getId())
                        .isPresent();
            }
        }

        // Get history
        List<IssueHistoryResponse> history = issueHistoryRepository
                .findByIssueIdOrderByChangedAtDesc(issue.getId())
                .stream()
                .map(h -> IssueHistoryResponse.builder()
                        .changedBy(h.getChangedBy().getEmail())
                        .fromStatus(h.getFromStatus() != null ? h.getFromStatus().name() : null)
                        .toStatus(h.getToStatus().name())
                        .comment(h.getComment())
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());

        return IssueResponse.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .category(issue.getCategory().name())
                .priority(issue.getPriority().name())
                .status(issue.getStatus().name())
                .reportedBy(issue.getReportedBy().getEmail())
                .location(issue.getLocation())
                .createdAt(issue.getCreatedAt())
                .resolvedAt(issue.getResolvedAt())
                .photoUrls(photoUrls)
                .upvoteCount(upvoteCount)
                .hasUpvoted(hasUpvoted)
                .history(history)
                .build();
    }
}