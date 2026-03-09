package com.example.smart_campus.service;

import com.example.smart_campus.dto.IssueRequest;
import com.example.smart_campus.dto.IssueResponse;
import com.example.smart_campus.model.Issue;
import com.example.smart_campus.model.User;
import com.example.smart_campus.repository.IssueRepository;
import com.example.smart_campus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

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

        try {
            emailService.sendIssueConfirmation(user.getEmail(), saved);
        } catch (Exception e) {
            System.err.println("Email notification failed (non-fatal): " + e.getMessage());
        }

        return mapToResponse(saved);
    }

    // ── Read: My Issues ───────────────────────────────────
    @Transactional(readOnly = true)
    public List<IssueResponse> getMyIssues(String email) {
        User user = findUserByEmail(email);
        return issueRepository
                .findByReportedBy(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Read: Single ──────────────────────────────────────
    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Long id) {
        return mapToResponse(findIssueById(id));
    }

    // ── Read: All ─────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<IssueResponse> getAllIssues() {
        return issueRepository.findAll()
                .stream()
                .map(this::mapToResponse)
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

        return mapToResponse(issueRepository.save(issue));
    }

    // ── Update: Status ────────────────────────────────────
    @Transactional
    public IssueResponse updateStatus(Long id, Issue.Status status) {
        Issue issue = findIssueById(id);

        issue.setStatus(status);
        issue.setUpdatedAt(LocalDateTime.now());

        if (status == Issue.Status.RESOLVED) {
            issue.setResolvedAt(LocalDateTime.now());
        }

        Issue saved = issueRepository.save(issue);

        try {
            emailService.sendStatusUpdate(saved.getReportedBy().getEmail(), saved);
        } catch (Exception e) {
            System.err.println("Email notification failed (non-fatal): " + e.getMessage());
        }

        return mapToResponse(saved);
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

    private IssueResponse mapToResponse(Issue issue) {
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
                .build();
    }
}
