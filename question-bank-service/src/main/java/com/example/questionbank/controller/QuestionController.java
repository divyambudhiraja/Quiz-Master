package com.example.questionbank.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.example.questionbank.model.Question;
import com.example.questionbank.repository.QuestionRepository;
import com.example.questionbank.service.QuestionService;
import com.example.questionbank.util.JwtUtil;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    // Get all available quizzes (unique quizIds)
    @GetMapping("/quiz/all")
    public List<String> getAllQuizzes() {
        // Get all questions, extract unique quizIds
        List<Question> questions = service.getAllQuestions();
        return questions.stream()
                .map(Question::getQuizId)
                .filter(qid -> qid != null && !qid.isEmpty())
                .distinct()
                .collect(java.util.stream.Collectors.toList());
    }

    @Autowired
    private QuestionService service;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${result.service.url:http://localhost:8082}")
    private String resultServiceUrl;
    private final RestTemplate restTemplate = new RestTemplate();

    // Get questions by quizId
    @GetMapping("/quiz/{quizId}")
    public List<Question> getQuestions(@PathVariable String quizId) {
        return service.getQuestionsByQuizId(quizId);
    }

    // Get question by ID
    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        Question question = service.getQuestionById(id); // ✅ fixed here
        if (question != null) {
            return ResponseEntity.ok(question);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Add new question
    @PostMapping("/add")
    public ResponseEntity<?> addQuestion(@RequestBody Question question,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            question.setHostUsername(username);
        }
        questionRepository.save(question);
        return ResponseEntity.ok(question);
    }

    // Update question
    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question updated) {
        Question q = service.updateQuestion(id, updated);
        if (q != null) {
            return ResponseEntity.ok(q);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete question
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteQuestion(@PathVariable Long id) {
        boolean exists = service.deleteQuestion(id);
        if (exists) {
            return ResponseEntity.ok("Question deleted successfully");
        } else {
            return ResponseEntity.status(404).body("Question not found");
        }
    }

    // Get quizzes by host
    @GetMapping("/host/{username}")
    public ResponseEntity<?> getQuizzesByHost(@PathVariable String username) {
        List<String> quizIds = questionRepository.findDistinctQuizIdsByHostUsername(username);
        return ResponseEntity.ok(quizIds);
    }

    // Delete an entire quiz (all questions and results)
    @DeleteMapping("/quiz/{quizId}")
    public ResponseEntity<String> deleteQuiz(@PathVariable String quizId) {
        // Delete all questions for this quiz
        List<Question> questions = questionRepository.findByQuizId(quizId);
        try {
            questionRepository.deleteAll(questions);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete questions for quiz: " + e.getMessage());
        }

        // Call result-service to delete all results for this quiz
        try {
            String url = resultServiceUrl + "/api/results/quiz/" + quizId;
            restTemplate.delete(url);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Questions deleted, but failed to delete results: " + e.getMessage());
        }

        return ResponseEntity.ok("Quiz and all related results deleted successfully");
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
