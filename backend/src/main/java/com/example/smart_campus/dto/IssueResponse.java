package com.example.smart_campus.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

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
    
    private List<String> photoUrls;
    private long upvoteCount;
    private boolean hasUpvoted;
    private List<IssueHistoryResponse> history;
}