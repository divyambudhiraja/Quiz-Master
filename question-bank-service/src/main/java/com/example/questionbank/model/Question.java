package com.example.questionbank.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private String quizId;
    private String hostUsername; // Added field for host username

    // Getters
    public Long getId() {
        return id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public String getOptionA() {
        return optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public String getQuizId() {
        return quizId;
    }

    public String getHostUsername() { // Getter for hostUsername
        return hostUsername;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public void setHostUsername(String hostUsername) { // Setter for hostUsername
        this.hostUsername = hostUsername;
    }
}
