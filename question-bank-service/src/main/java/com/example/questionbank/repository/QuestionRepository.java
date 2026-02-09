package com.example.questionbank.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.questionbank.model.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizId(String quizId);

    @Query("SELECT DISTINCT q.quizId FROM Question q WHERE q.hostUsername = :hostUsername")
    List<String> findDistinctQuizIdsByHostUsername(@Param("hostUsername") String hostUsername);
}
