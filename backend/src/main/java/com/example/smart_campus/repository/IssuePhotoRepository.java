package com.example.smart_campus.repository;

import com.example.smart_campus.model.IssuePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssuePhotoRepository extends JpaRepository<IssuePhoto, Long> {
    List<IssuePhoto> findByIssueId(Long issueId);
    void deleteByIssueId(Long issueId);
}