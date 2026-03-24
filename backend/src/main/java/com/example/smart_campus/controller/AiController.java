package com.example.smart_campus.controller;

import com.example.smart_campus.dto.AiClassificationResponse;
import com.example.smart_campus.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final AiService aiService;

    @PostMapping("/classify")
    public ResponseEntity<AiClassificationResponse> classifyIssue(@RequestBody ClassifyRequest request) {
        try {
            log.info("Received AI classification request for description: {}", 
                request.getDescription() != null ? request.getDescription().substring(0, Math.min(50, request.getDescription().length())) + "..." : "null");
            
            // Try AI classification first
            AiClassificationResponse response = aiService.classifyIssue(request.getDescription());
            log.info("AI classification result: category={}, priority={}", response.getCategory(), response.getPriority());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("AI classification failed: {}", e.getMessage(), e);
            
            // Always return a valid fallback instead of 500 error
            log.warn("Returning fallback classification due to error");
            return ResponseEntity.ok(aiService.fallbackClassification(request.getDescription()));
        }
    }

    public static class ClassifyRequest {
        private String description;

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
