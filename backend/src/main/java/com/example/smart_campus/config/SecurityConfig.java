package com.example.smart_campus.config;

import com.example.smart_campus.service.JwtService;
import com.example.smart_campus.service.UserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.stream.Collectors;
import java.io.IOException;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtService jwtService;
    private final UserService userService;

    @Bean
    public OncePerRequestFilter jwtAuthFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain filterChain)
                    throws ServletException, IOException {

                String path = request.getRequestURI();

                if (path.startsWith("/api/auth/") || "OPTIONS".equals(request.getMethod())) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String authHeader = request.getHeader("Authorization");

                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String token = authHeader.substring(7);

                try {
                    String username = jwtService.extractUsername(token);

                    if (username != null &&
                            SecurityContextHolder.getContext().getAuthentication() == null) {

                        UserDetails userDetails = userService.loadUserByUsername(username);

                        if (jwtService.isTokenValid(token, userDetails)) {
                            Claims claims = jwtService.getClaims(token);
                            String roles = (String) claims.get("roles");

                            List<SimpleGrantedAuthority> authorities;

                            if (roles != null && !roles.trim().isEmpty()) {
                                authorities = Arrays.stream(roles.split(","))
                                        .map(String::trim)
                                        .filter(r -> !r.isEmpty())
                                        .map(SimpleGrantedAuthority::new)
                                        .collect(Collectors.toList());
                            } else {
                                authorities = userDetails.getAuthorities().stream()
                                        .map(auth -> new SimpleGrantedAuthority(auth.getAuthority()))
                                        .collect(Collectors.toList());
                            }

                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails, null, authorities);

                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    }
                } catch (Exception e) {
                    // ignore
                }

                filterChain.doFilter(request, response);
            }
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           OncePerRequestFilter jwtAuthFilter) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers("/api/auth/**").permitAll()

                // ✅ ADDED HERE
                .requestMatchers("/api/files/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                .requestMatchers("/", "/static/**", "/favicon.ico",
                                 "/manifest.json", "/robots.txt",
                                 "/asset-manifest.json", "/logo192.png",
                                 "/logo512.png", "/css/**", "/js/**").permitAll()

                .requestMatchers("/h2-console/**").permitAll()

                .requestMatchers("/login", "/register", "/dashboard",
                                 "/admin", "/issues", "/edit",
                                 "/admin/**", "/issues/**").permitAll()

                .requestMatchers("/api/admin/**")
                    .hasAuthority("ROLE_ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/issues")
                    .hasAnyAuthority("ROLE_STUDENT", "ROLE_ADMIN", "ROLE_DEPARTMENT_HEAD")

                .requestMatchers(HttpMethod.GET, "/api/issues/my")
                    .hasAnyAuthority("ROLE_STUDENT", "ROLE_ADMIN", "ROLE_DEPARTMENT_HEAD")

                .requestMatchers(HttpMethod.GET, "/api/issues/**")
                    .hasAnyAuthority("ROLE_STUDENT", "ROLE_ADMIN", "ROLE_DEPARTMENT_HEAD")

                .requestMatchers(HttpMethod.PUT, "/api/issues/**")
                    .hasAnyAuthority("ROLE_STUDENT", "ROLE_ADMIN", "ROLE_DEPARTMENT_HEAD")

                .requestMatchers(HttpMethod.DELETE, "/api/issues/**")
                    .hasAnyAuthority("ROLE_STUDENT", "ROLE_ADMIN", "ROLE_DEPARTMENT_HEAD")

                .requestMatchers(HttpMethod.PATCH, "/api/issues/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DEPARTMENT_HEAD")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "*" // Allow all origins like Netlify to access the backend
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With"
        ));

        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}