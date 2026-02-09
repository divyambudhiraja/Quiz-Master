package com.example.authquiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.authquiz.model.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Student findByUsername(String username);

    @Modifying
    @Query("update Student s set s.role = :role where s.username = :username")
    int updateRoleByUsername(@Param("username") String username, @Param("role") String role);
}
