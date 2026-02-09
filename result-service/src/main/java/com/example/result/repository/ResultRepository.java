package com.example.result.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.result.model.Result;

public interface ResultRepository extends JpaRepository<Result, Long> {
	java.util.List<Result> findByQuizId(String quizId);

	boolean existsByQuizIdAndStudentUsername(String quizId, String studentUsername);

	@Modifying
	@Transactional
	@Query("DELETE FROM Result r WHERE r.quizId = :quizId")
	void deleteByQuizId(@Param("quizId") String quizId);

	@Modifying
	@Transactional
	@Query("DELETE FROM Result r WHERE r.quizId = :quizId AND r.studentUsername = :studentUsername")
	void deleteByQuizIdAndStudentUsername(@Param("quizId") String quizId,
			@Param("studentUsername") String studentUsername);
}
