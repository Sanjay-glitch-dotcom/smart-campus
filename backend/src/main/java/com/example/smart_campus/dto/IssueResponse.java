package com.example.smart_campus.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class IssueResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String reportedBy;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}