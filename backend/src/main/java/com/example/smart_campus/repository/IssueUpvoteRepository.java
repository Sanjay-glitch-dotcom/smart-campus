package com.example.smart_campus.repository;

import com.example.smart_campus.model.IssueUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssueUpvoteRepository extends JpaRepository<IssueUpvote, Long> {
    List<IssueUpvote> findByIssueId(Long issueId);
    Optional<IssueUpvote> findByIssueIdAndUserId(Long issueId, Long userId);
    void deleteByIssueIdAndUserId(Long issueId, Long userId);
    
    @Query("SELECT COUNT(u) FROM IssueUpvote u WHERE u.issue.id = :issueId")
    long countByIssueId(@Param("issueId") Long issueId);
}