package com.example.smart_campus.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "issue_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;
    
    @Enumerated(EnumType.STRING)
    private Issue.Status fromStatus;
    
    @Enumerated(EnumType.STRING)
    private Issue.Status toStatus;
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @Builder.Default
    private LocalDateTime changedAt = LocalDateTime.now();
}