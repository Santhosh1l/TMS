package com.tms.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import com.tms.backend.dto.TaskDTO;
import com.tms.backend.dto.TaskUpdateDTO;
import com.tms.backend.enums.TaskStatus;
import com.tms.backend.enums.TaskType;
import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;
import com.tms.backend.service.TaskService;


import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tms/tasks")
public class TaskController {

	private final TaskService taskService;

	public TaskController(TaskService taskService) {

		this.taskService = taskService;
	}

	
	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<TaskDTO>> getAllTasks(
			@RequestParam(required = false) Long sessionId,
			@RequestParam(required = false) Long courseId,
			@RequestParam(required = false) Long userId,
			@RequestParam(required = false) TaskStatus status, 
			@RequestParam(required = false) TaskType type) {
		return ResponseEntity.status(200).body(taskService.getAllTasks(sessionId, courseId, userId, status, type));
	}

	@GetMapping("/{taskId}")
	@PreAuthorize("hasAnyRole('ADMIN', 'CO_TRAINER')")
	public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long taskId) {
		return ResponseEntity.status(200).body(taskService.getTaskById(taskId));

	}



	@PreAuthorize("hasAnyRole('ADMIN', 'CO_TRAINER')")
	@PostMapping
	public ResponseEntity<TaskDTO> createTaskByTaskType(@Valid @RequestBody TaskDTO dto){
		return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTaskByTaskType(dto));
	}
	


	@PreAuthorize("hasAnyRole('ADMIN', 'CO_TRAINER')")
	@PutMapping
	public ResponseEntity<TaskDTO> updateTask(@Valid @RequestBody TaskUpdateDTO dto) {
		return ResponseEntity.status(200).body(taskService.updateTask(dto));
	}
	
	

	@PreAuthorize("hasAnyRole('ADMIN', 'CO_TRAINER')")
	@DeleteMapping("/{taskId}")
	public ResponseEntity<Void> deleteTask(@PathVariable Long taskId){
		taskService.deleteTask(taskId);
		return ResponseEntity.noContent().build();
		
		
	}

}
