package com.example.smart_campus.dto;

import com.example.smart_campus.model.Issue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IssueRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private Issue.Category category;

    @NotNull(message = "Priority is required")
    private Issue.Priority priority;

    private String location;
}