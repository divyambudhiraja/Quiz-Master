package com.example.result.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.result.model.Result;
import com.example.result.service.ResultService;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    // Check if a user has already attempted a quiz
    @GetMapping("/attempted/{quizId}/{studentUsername}")
    public ResponseEntity<Boolean> hasUserAttemptedQuiz(@PathVariable String quizId,
            @PathVariable String studentUsername) {
        boolean attempted = service.hasUserAttemptedQuiz(quizId, studentUsername);
        return ResponseEntity.ok(attempted);
    }

    // Delete all results for a quiz
    @DeleteMapping("/quiz/{quizId}")
    public ResponseEntity<String> deleteResultsByQuizId(@PathVariable String quizId) {
        try {
            service.deleteResultsByQuizId(quizId);
            return ResponseEntity.ok("All results for quiz deleted");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to delete results for quiz: " + e.getMessage());
        }
    }

    // Delete a specific user's result for a quiz
    @DeleteMapping("/quiz/{quizId}/user/{studentUsername}")
    public ResponseEntity<String> deleteUserResult(@PathVariable String quizId, @PathVariable String studentUsername) {
        try {
            service.deleteResultForUser(quizId, studentUsername);
            return ResponseEntity.ok("Result for user deleted");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to delete result for user: " + e.getMessage());
        }
    }

    @Autowired
    private ResultService service;

    // Accepts: { quizId, answers: [{questionId, selectedAnswer}], studentUsername
    // (optional) }
    @PostMapping("/submit")
    public ResponseEntity<Result> submitQuiz(@RequestBody Map<String, Object> payload) {
        String quizId = (String) payload.get("quizId");
        List<Map<String, Object>> answers = (List<Map<String, Object>>) payload.get("answers");
        String studentUsername = (String) payload.getOrDefault("studentUsername", "anonymous");

        // Fetch questions for this quiz from question-bank-service
        RestTemplate restTemplate = new RestTemplate();
        String questionServiceUrl = "http://localhost:8081/api/questions/quiz/" + quizId;
        List<Map<String, Object>> questions;
        try {
            questions = restTemplate.getForObject(questionServiceUrl, List.class);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }

        int totalQuestions = questions.size();
        int correctAnswers = 0;
        for (Map<String, Object> q : questions) {
            Object qidObj = q.get("id");
            if (qidObj == null)
                continue;
            Long qid = (qidObj instanceof Integer) ? ((Integer) qidObj).longValue() : (Long) qidObj;
            String correct = (String) q.get("correctAnswer");
            for (Map<String, Object> ans : answers) {
                String ansQidStr = String.valueOf(ans.get("questionId"));
                if (ansQidStr.equals(String.valueOf(qid))) {
                    String selected = (String) ans.get("selectedAnswer");
                    if (selected != null && selected.equals(correct)) {
                        correctAnswers++;
                    }
                }
            }
        }
        int score = correctAnswers * 1; // 1 point per correct answer
        Result result = new Result();
        result.setStudentUsername(studentUsername);
        result.setQuizId(quizId);
        result.setTotalQuestions(totalQuestions);
        result.setCorrectAnswers(correctAnswers);
        result.setScore(score);
        Result savedResult = service.saveResult(result);
        return ResponseEntity.ok(savedResult);
    }

    // Fetch a result
    @GetMapping("/{id}")
    public ResponseEntity<Result> getResult(@PathVariable Long id) {
        Result result = service.getResult(id);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get all results for a quiz (participants)
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Result>> getResultsByQuizId(@PathVariable String quizId) {
        List<Result> results = service.getResultsByQuizId(quizId);
        return ResponseEntity.ok(results);
    }
}
