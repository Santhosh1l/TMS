package com.tms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tms.backend.enums.TaskAttemptStatus;
import com.tms.backend.model.TaskAttempt;

@Repository
public interface TaskAttemptRepository extends JpaRepository<TaskAttempt, Long> {

	List<TaskAttempt> findAllByIsDeleteFalse();

	Optional<TaskAttempt> findByIdAndIsDeleteFalse(Long attemptId);

	Optional<TaskAttempt> findByTask_IdAndUser_IdAndIsDeleteFalse(Long taskId, Long userId);
}
