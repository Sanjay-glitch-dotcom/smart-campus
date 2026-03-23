package com.example.smart_campus.controller;

import com.example.smart_campus.dto.LoginRequest;
import com.example.smart_campus.dto.RegisterRequest;
import com.example.smart_campus.service.JwtService;
import com.example.smart_campus.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Request body is required"));
        }
        userService.register(request);
        return ResponseEntity.ok(Map.of("message", "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Request body is required"));
        }
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Email and password are required"));
        }
        
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                .body(Map.of("message", "Invalid email or password"));
        }

        UserDetails userDetails = userService.loadUserByUsername(request.getEmail());
        if (userDetails == null) {
            return ResponseEntity.status(401)
                .body(Map.of("message", "User not found"));
        }
        
        String token = jwtService.generateToken(userDetails);

        // Send role with ROLE_ prefix for consistency
        String role = userDetails.getAuthorities()
            .iterator().next()
            .getAuthority();

        return ResponseEntity.ok(Map.of(
            "token", token,
            "email", userDetails.getUsername(),
            "role",  role    // sends "ROLE_ADMIN"
        ));
    }
}