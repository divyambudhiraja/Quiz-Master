package com.example.result.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.result.model.Result;
import com.example.result.repository.ResultRepository;

@Service
public class ResultService {
    private static final Logger logger = LoggerFactory.getLogger(ResultService.class);

    public boolean hasUserAttemptedQuiz(String quizId, String studentUsername) {
        return repository.existsByQuizIdAndStudentUsername(quizId, studentUsername);
    }

    public void deleteResultsByQuizId(String quizId) {
        int before = repository.findByQuizId(quizId).size();
        logger.info("[ResultService] Results before delete for quizId {}: {}", quizId, before);
        repository.deleteByQuizId(quizId);
        int after = repository.findByQuizId(quizId).size();
        logger.info("[ResultService] Results after delete for quizId {}: {}", quizId, after);
    }

    @Autowired
    private ResultRepository repository;

    public Result saveResult(Result result) {
        return repository.save(result);
    }

    public Result getResult(Long id) {
        return repository.findById(id).orElse(null);
    }

    public java.util.List<Result> getResultsByQuizId(String quizId) {
        return repository.findByQuizId(quizId);
    }

    public void deleteResultForUser(String quizId, String studentUsername) {
        repository.deleteByQuizIdAndStudentUsername(quizId, studentUsername);
    }
}
