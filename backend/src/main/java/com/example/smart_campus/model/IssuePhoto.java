package com.example.smart_campus.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "issue_photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssuePhoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;
    
    @Column(columnDefinition = "TEXT")
    private String photoUrl;
    
    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}