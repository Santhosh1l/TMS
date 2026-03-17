package com.tms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tms.backend.enums.TaskType;
import com.tms.backend.model.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

	Optional<Task> findByIdAndIsDeleteFalse(Long taskId);

	List<Task> findAllByIsDeleteFalse();

	List<Task> findAllByCourse_IdAndIsDeleteFalse(Long courseId);

	List<Task> findAllByCourse_IdAndTypeAndIsDeleteFalse(Long courseId, TaskType type);

	List<Task> findAllBySession_IdAndIsDeleteFalse(Long sessionId);

}
