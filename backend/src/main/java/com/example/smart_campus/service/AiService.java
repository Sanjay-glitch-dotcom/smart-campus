package com.example.smart_campus.service;

import com.example.smart_campus.dto.AiClassificationResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiClassificationResponse classifyIssue(String description) {
        log.info("Starting AI classification for description: {}", description.substring(0, Math.min(50, description.length())) + "...");
        
        try {
            if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
                log.error("OpenAI API key not configured! Key is null or empty. Current value: '{}'", openaiApiKey);
                return fallbackClassification(description);
            }
            
            log.info("Using OpenAI API key (first 10 chars): {}...", openaiApiKey.substring(0, Math.min(10, openaiApiKey.length())));
            
            String prompt = buildPrompt(description);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");
            requestBody.put("messages", new Object[]{
                Map.of("role", "system", "content", "You are an intelligent assistant for a Smart Campus Issue Reporting System. Your task is to categorize and prioritize campus issues."),
                Map.of("role", "user", "content", prompt)
            });
            requestBody.put("temperature", 0.3);
            requestBody.put("max_tokens", 150);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions", 
                HttpMethod.POST,
                entity, 
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Object choices = responseBody.get("choices");
                
                if (choices instanceof java.util.List<?> choicesList && !choicesList.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> firstChoice = (Map<String, Object>) choicesList.get(0);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    String content = (String) message.get("content");
                    
                    return parseJsonResponse(content);
                }
            }
            
            log.warn("Failed to get valid response from OpenAI, using fallback");
            return fallbackClassification(description);
            
        } catch (Exception e) {
            log.error("Error classifying issue with AI: {}", e.getMessage(), e);
            return fallbackClassification(description);
        }
    }

    private String buildPrompt(String description) {
        return String.format("""
            You are an intelligent assistant for a Smart Campus Issue Reporting System. 
            Your task is to categorize and prioritize campus issues.

            STRICT RULES:
            1. CATEGORIES: [WIFI, CLASSROOM, LABORATORY, HOSTEL, OTHER]
            2. PRIORITY: 
               - LOW (Minor inconvenience)
               - MEDIUM (Needs attention, non-critical)
               - HIGH (Safety risk, infrastructure failure, or affecting many users)
            3. OUTPUT FORMAT: Return ONLY a JSON object with the following structure. No extra text, no markdown, no explanations.

            {
              "category": "<Category Name>",
              "priority": "<LOW/MEDIUM/HIGH>"
            }

            ISSUE DESCRIPTION:
            %s
            """, description);
    }

    private AiClassificationResponse parseJsonResponse(String content) {
        try {
            // Clean up the response to ensure it's valid JSON
            String cleanedContent = content.trim()
                .replaceAll("```json", "")
                .replaceAll("```", "")
                .replaceAll("\n", " ");
            
            // Parse JSON response
            @SuppressWarnings("unchecked")
            Map<String, Object> response = objectMapper.readValue(cleanedContent, Map.class);
            
            String category = (String) response.get("category");
            String priority = (String) response.get("priority");
            
            // Validate and normalize values
            category = normalizeCategory(category);
            priority = normalizePriority(priority);
            
            return new AiClassificationResponse(category, priority);
            
        } catch (Exception e) {
            log.warn("Failed to parse AI response as JSON: {}", content, e);
            return fallbackClassification(content);
        }
    }

    private String normalizeCategory(String category) {
        if (category == null) return "OTHER";
        
        String normalized = category.trim();
        
        // Map to frontend expected values
        if (normalized.equalsIgnoreCase("WiFi") || normalized.equalsIgnoreCase("wifi")) {
            return "WIFI";
        } else if (normalized.equalsIgnoreCase("Maintenance") || normalized.equalsIgnoreCase("maintenance")) {
            return "OTHER"; // Maintenance maps to OTHER in frontend
        } else if (normalized.equalsIgnoreCase("Hostel") || normalized.equalsIgnoreCase("hostel")) {
            return "HOSTEL";
        } else if (normalized.equalsIgnoreCase("Laboratory") || normalized.equalsIgnoreCase("laboratory") || normalized.equalsIgnoreCase("lab")) {
            return "LABORATORY";
        } else if (normalized.equalsIgnoreCase("Classroom") || normalized.equalsIgnoreCase("classroom")) {
            return "CLASSROOM";
        } else if (normalized.equalsIgnoreCase("Others") || normalized.equalsIgnoreCase("other")) {
            return "OTHER";
        }
        
        return "OTHER";
    }

    private String normalizePriority(String priority) {
        if (priority == null) return "Medium";
        
        String normalized = priority.trim();
        String[] validPriorities = {"Low", "Medium", "High"};
        
        for (String valid : validPriorities) {
            if (valid.equalsIgnoreCase(normalized)) {
                return valid;
            }
        }
        return "Medium";
    }

    public AiClassificationResponse fallbackClassification(String description) {
        // Simple keyword-based fallback classification
        String desc = description.toLowerCase();
        
        // Category classification (using frontend expected values)
        // Order matters - check for more specific terms first
        String category = "OTHER";
        if (desc.contains("classroom") || desc.contains("lecture") || desc.contains("projector")) {
            category = "CLASSROOM";
        } else if (desc.contains("wifi") || desc.contains("internet") || desc.contains("network")) {
            category = "WIFI";
        } else if (desc.contains("lab") || desc.contains("laboratory") || desc.contains("equipment")) {
            category = "LABORATORY";
        } else if (desc.contains("hostel") || desc.contains("dorm")) {
            category = "HOSTEL";
        } else if (desc.contains("maintenance") || desc.contains("repair") || desc.contains("broken")) {
            category = "OTHER"; // Maintenance maps to OTHER in frontend
        }
        
        // Priority classification
        String priority = "MEDIUM";
        if (desc.contains("urgent") || desc.contains("emergency") || desc.contains("safety") || 
            desc.contains("danger") || desc.contains("leak") || desc.contains("fire")) {
            priority = "HIGH";
        } else if (desc.contains("minor") || desc.contains("small") || desc.contains("suggestion")) {
            priority = "LOW";
        }
        
        return new AiClassificationResponse(category, priority);
    }
}
