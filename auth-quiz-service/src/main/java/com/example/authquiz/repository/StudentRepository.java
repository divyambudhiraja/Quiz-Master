package com.example.authquiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.authquiz.model.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Student findByUsername(String username);
}
