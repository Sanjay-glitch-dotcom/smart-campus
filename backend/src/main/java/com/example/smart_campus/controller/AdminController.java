package com.example.smart_campus.controller;

import com.example.smart_campus.dto.IssueResponse;
import com.example.smart_campus.repository.IssueRepository;
import com.example.smart_campus.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final IssueService issueService;
    private final IssueRepository issueRepository;

    @GetMapping("/issues")
    public ResponseEntity<List<IssueResponse>> getAllIssues() {
        return ResponseEntity.ok(issueService.getAllIssues());
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();

        Map<String, Long> byStatus = new LinkedHashMap<>();
        issueRepository.countByStatus()
            .forEach(row -> byStatus.put(row[0].toString(), (Long) row[1]));

        Map<String, Long> byCategory = new LinkedHashMap<>();
        issueRepository.countByCategory()
            .forEach(row -> byCategory.put(row[0].toString(), (Long) row[1]));

        summary.put("totalIssues", issueRepository.count());
        summary.put("byStatus", byStatus);
        summary.put("byCategory", byCategory);

        return ResponseEntity.ok(summary);
    }
}