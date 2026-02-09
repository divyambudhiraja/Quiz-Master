package com.example.authquiz;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.authquiz.model.Student;
import com.example.authquiz.service.StudentService;

@Component
public class DefaultAdminSeeder implements CommandLineRunner {

    private final StudentService studentService;

    public DefaultAdminSeeder(StudentService studentService) {
        this.studentService = studentService;
    }

    @Override
    public void run(String... args) {
        // Create a default admin user if it does not exist
        final String defaultAdminUsername = "admin";
        final String defaultAdminPassword = "admin123";

        Student existing = studentService.findByUsername(defaultAdminUsername);
        if (existing == null) {
            Student admin = new Student();
            admin.setUsername(defaultAdminUsername);
            admin.setPassword(defaultAdminPassword);
            admin.setRole("ADMIN");
            studentService.save(admin);
        }
    }
}

