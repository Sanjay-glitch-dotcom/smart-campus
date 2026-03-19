package com.example.smart_campus.service;

import com.example.smart_campus.dto.FileUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp"};

    public FileUploadResponse uploadFile(MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return createErrorResponse("File is empty");
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !isValidImageFile(originalFilename)) {
                return createErrorResponse("Invalid file type. Only images are allowed.");
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            // Save file
            Files.copy(file.getInputStream(), filePath);

            // Return success response
            FileUploadResponse response = new FileUploadResponse();
            response.setPhotoUrl("/uploads/" + uniqueFilename);
            response.setMessage("File uploaded successfully");
            response.setSuccess(true);
            return response;

        } catch (IOException e) {
            return createErrorResponse("Failed to upload file: " + e.getMessage());
        }
    }

    private boolean isValidImageFile(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (allowedExt.equals(extension)) {
                return true;
            }
        }
        return false;
    }

    private String getFileExtension(String filename) {
        return filename.substring(filename.lastIndexOf("."));
    }

    private FileUploadResponse createErrorResponse(String message) {
        FileUploadResponse response = new FileUploadResponse();
        response.setMessage(message);
        response.setSuccess(false);
        return response;
    }
}