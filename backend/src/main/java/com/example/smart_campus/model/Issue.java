package com.example.smart_campus.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;

    private String location;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    public enum Category {
        WIFI, CLASSROOM, LABORATORY, HOSTEL, OTHER
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED
    }
}