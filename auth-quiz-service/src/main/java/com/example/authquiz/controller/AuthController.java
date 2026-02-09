package com.example.authquiz.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.example.authquiz.model.Student;
import com.example.authquiz.security.JwtUtil;
import com.example.authquiz.service.StudentService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private StudentService service;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Student student) {
        try {
            // Check if username already exists
            if (service.findByUsername(student.getUsername()) != null) {
                return ResponseEntity.status(409)
                        .body(java.util.Collections.singletonMap("error", "Username already exists"));
            }
            // Default all new users to USER role if not set
            if (student.getRole() == null || student.getRole().trim().isEmpty()) {
                student.setRole("USER");
            }
            Student saved = service.save(student);
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Registration successful"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Registration failed"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Student student) {
        Student dbStudent = service.findByUsername(student.getUsername());
        if (dbStudent != null && dbStudent.getPassword().equals(student.getPassword())) {
            String token = jwtUtil.generateToken(dbStudent.getUsername(),
                    dbStudent.getRole() == null ? "USER" : dbStudent.getRole());
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("token", token);
            body.put("username", dbStudent.getUsername());
            body.put("role", dbStudent.getRole());
            return ResponseEntity.ok(body);
        }
        return ResponseEntity.status(401).body(java.util.Collections.singletonMap("error", "Invalid credentials"));
    }

    // Promote an existing user to ADMIN (simple admin feature)
    @PostMapping("/make-admin")
    public ResponseEntity<?> makeAdmin(@RequestBody java.util.Map<String, String> payload) {
        String usernameToPromote = payload.get("username");
        if (usernameToPromote == null || usernameToPromote.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(java.util.Collections.singletonMap("error", "Username is required"));
        }
        try {
            int updated = service.promoteToAdmin(usernameToPromote);
            if (updated == 0) {
                return ResponseEntity.status(404).body(java.util.Collections.singletonMap("error", "User not found"));
            }
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "User promoted to admin"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Failed to promote user"));
        }
    }

    // List all users with their roles
    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        java.util.List<Student> users = service.findAll();
        return ResponseEntity.ok(users);
    }

    @Configuration
    public class WebConfig implements WebMvcConfigurer {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://127.0.0.1:3000", "http://localhost:5500", "http://127.0.0.1:5500")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .allowCredentials(true);
        }
    }

}
