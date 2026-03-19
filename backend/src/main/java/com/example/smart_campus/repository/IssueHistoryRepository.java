package com.example.smart_campus.repository;

import com.example.smart_campus.model.IssueHistory;
import com.example.smart_campus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueHistoryRepository extends JpaRepository<IssueHistory, Long> {
    List<IssueHistory> findByIssueIdOrderByChangedAtDesc(Long issueId);
    List<IssueHistory> findByIssueIdAndChangedByOrderByChangedAtDesc(Long issueId, User changedBy);
}