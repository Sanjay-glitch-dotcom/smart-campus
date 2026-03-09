package com.example.smart_campus.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Serves React's index.html for every non-API, non-static route.
 * This is required for React Router (client-side routing) to work
 * when the user navigates directly to or refreshes a page like /login.
 */
@Controller
public class HomeController {

    @GetMapping(value = {
        "/",
        "/login",
        "/register",
        "/dashboard",
        "/admin",
        "/issues",
        "/edit",
        "/admin/**",
        "/issues/**"
    })
    @ResponseBody
    public ResponseEntity<Resource> index(HttpServletRequest request) {
        Resource resource = new ClassPathResource("static/index.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }
}
