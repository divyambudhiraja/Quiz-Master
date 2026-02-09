package com.example.authquiz.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authquiz.model.Student;
import com.example.authquiz.repository.StudentRepository;

@Service
public class StudentService {
    @Autowired
    private StudentRepository repo;

    public Student save(Student student) {
        return repo.save(student);
    }

    public Student findByUsername(String username) {
        return repo.findByUsername(username);
    }

    public java.util.List<Student> findAll() {
        return repo.findAll();
    }

    @Transactional
    public int promoteToAdmin(String username) {
        return repo.updateRoleByUsername(username, "ADMIN");
    }
}
