package com.example.smart_campus.controller;

import com.example.smart_campus.dto.AiClassificationResponse;
import com.example.smart_campus.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/classify")
    public ResponseEntity<AiClassificationResponse> classifyIssue(@RequestBody ClassifyRequest request) {
        try {
            AiClassificationResponse response = aiService.classifyIssue(request.getDescription());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new AiClassificationResponse("Others", "Medium"));
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
