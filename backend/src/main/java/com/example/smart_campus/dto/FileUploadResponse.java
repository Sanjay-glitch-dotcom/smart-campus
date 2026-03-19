package com.example.smart_campus.dto;

import lombok.Data;

@Data
public class FileUploadResponse {
    private String photoUrl;
    private String message;
    private boolean success;
}