package com.example.questionbank.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.questionbank.model.Question;
import com.example.questionbank.repository.QuestionRepository;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository repository;

    public List<Question> getAllQuestions() {
        return repository.findAll();
    }

    public Question addQuestion(Question question) {
        return repository.save(question);
    }

    public Question getQuestionById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Question updateQuestion(Long id, Question updated) {
        if (repository.existsById(id)) {
            updated.setId(id); // Ensure ID stays the same
            return repository.save(updated);
        }
        return null;
    }

    public boolean deleteQuestion(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Question> getQuestionsByQuizId(String quizId) {
        return repository.findByQuizId(quizId);
    }

}
