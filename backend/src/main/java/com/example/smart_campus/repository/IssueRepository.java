package com.example.smart_campus.repository;

import com.example.smart_campus.model.Issue;
import com.example.smart_campus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByReportedBy(User user);
    List<Issue> findByStatus(Issue.Status status);
    List<Issue> findByPriority(Issue.Priority priority);
    List<Issue> findByCategory(Issue.Category category);

    @Query("SELECT i.status, COUNT(i) FROM Issue i GROUP BY i.status")
    List<Object[]> countByStatus();

    @Query("SELECT i.category, COUNT(i) FROM Issue i GROUP BY i.category")
    List<Object[]> countByCategory();
}