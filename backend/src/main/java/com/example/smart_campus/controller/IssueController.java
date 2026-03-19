package com.example.smart_campus.controller;

import com.example.smart_campus.dto.IssueRequest;
import com.example.smart_campus.dto.IssueResponse;
import com.example.smart_campus.model.Issue;
import com.example.smart_campus.repository.IssueRepository;
import com.example.smart_campus.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final IssueRepository issueRepository;

    // ── Create ────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT','ROLE_ADMIN','ROLE_DEPARTMENT_HEAD')")
    public ResponseEntity<IssueResponse> submitIssue(
            @Valid @RequestBody IssueRequest request,
            Authentication auth) {
        return ResponseEntity.status(201)
                .body(issueService.createIssue(request, auth.getName()));
    }

    // ── Read: My Issues ───────────────────────────────────
    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT','ROLE_ADMIN','ROLE_DEPARTMENT_HEAD')")
    public ResponseEntity<List<IssueResponse>> getMyIssues(Authentication auth) {
        return ResponseEntity.ok(issueService.getMyIssues(auth.getName()));
    }

    // ── Read: Single Issue ────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT','ROLE_ADMIN','ROLE_DEPARTMENT_HEAD')")
    public ResponseEntity<IssueResponse> getIssueById(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(issueService.getIssueById(id, auth.getName()));
    }

    // ── Read: All Issues ──────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_DEPARTMENT_HEAD')")
    public ResponseEntity<List<IssueResponse>> getAllIssues(Authentication auth) {
        return ResponseEntity.ok(issueService.getAllIssues(auth.getName()));
    }

    // ── Update: Edit Issue Content ────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT','ROLE_ADMIN','ROLE_DEPARTMENT_HEAD')")
    public ResponseEntity<?> updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueRequest request,
            Authentication auth) {
        try {
            return ResponseEntity.ok(
                    issueService.updateIssue(id, request, auth.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ── Update: Status Only ───────────────────────────────
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_DEPARTMENT_HEAD')")
    public ResponseEntity<IssueResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam Issue.Status status,
            Authentication auth) {
        return ResponseEntity.ok(
                issueService.updateStatus(id, status, auth.getName()));
    }

    // ── Upvote System ─────────────────────────────────────
    @PutMapping("/{id}/upvote")   // ✅ FIXED: use PUT (matches frontend)
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT','ROLE_ADMIN','ROLE_DEPARTMENT_HEAD')")
    public ResponseEntity<Map<String, String>> toggleUpvote(
            @PathVariable Long id,
            Authentication auth) {
        issueService.toggleUpvote(id, auth.getName());
        return ResponseEntity.ok(
                Map.of("message", "Upvote toggled successfully"));
    }

    // ── Delete ────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT','ROLE_ADMIN','ROLE_DEPARTMENT_HEAD')")
    public ResponseEntity<?> deleteIssue(
            @PathVariable Long id,
            Authentication auth) {
        try {
            issueService.deleteIssue(id, auth.getName());
            return ResponseEntity.ok(
                    Map.of("message", "Issue deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}