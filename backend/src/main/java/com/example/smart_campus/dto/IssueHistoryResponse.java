package com.example.smart_campus.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class IssueHistoryResponse {
    private String changedBy;
    private String fromStatus;
    private String toStatus;
    private String comment;
    private LocalDateTime changedAt;
}