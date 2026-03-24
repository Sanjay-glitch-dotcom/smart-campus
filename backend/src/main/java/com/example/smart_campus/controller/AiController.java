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
            String description = request.getDescription();
            log.info("Processing classification for: {}", description != null ? description.substring(0, Math.min(30, description.length())) + "..." : "null");
            
            // Simple direct classification - no OpenAI dependency
            AiClassificationResponse response = simpleClassification(description);
            log.info("Classification result: category={}, priority={}", response.getCategory(), response.getPriority());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Classification failed: {}", e.getMessage(), e);
            return ResponseEntity.ok(new AiClassificationResponse("OTHER", "MEDIUM"));
        }
    }
    
    // Simple keyword-based classification - always works
    private AiClassificationResponse simpleClassification(String description) {
        if (description == null || description.trim().isEmpty()) {
            return new AiClassificationResponse("OTHER", "MEDIUM");
        }
        
        String desc = description.toLowerCase().trim();
        
        // Category classification
        String category = "OTHER";
        if (desc.contains("wifi") || desc.contains("internet") || desc.contains("network")) {
            category = "WIFI";
        } else if (desc.contains("classroom") || desc.contains("lecture") || desc.contains("projector") || desc.contains("room")) {
            category = "CLASSROOM";
        } else if (desc.contains("lab") || desc.contains("laboratory") || desc.contains("equipment")) {
            category = "LABORATORY";
        } else if (desc.contains("hostel") || desc.contains("dorm") || desc.contains("accommodation")) {
            category = "HOSTEL";
        }
        
        // Priority classification
        String priority = "MEDIUM";
        if (desc.contains("urgent") || desc.contains("emergency") || desc.contains("safety") || desc.contains("danger")) {
            priority = "HIGH";
        } else if (desc.contains("minor") || desc.contains("small") || desc.contains("suggestion")) {
            priority = "LOW";
        }
        
        return new AiClassificationResponse(category, priority);
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
