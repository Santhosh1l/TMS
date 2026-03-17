package com.tms.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tms.backend.dto.TaskAttemptDTO;
import com.tms.backend.dto.TaskAttemptUpdateDTO;
import com.tms.backend.enums.TaskAttemptStatus;
import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;
import com.tms.backend.service.TaskAttemptService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tms/task-attempts")
@Validated
public class TaskAttemptController {

	private final TaskAttemptService tastAttemptService;

	public TaskAttemptController(TaskAttemptService tastAttemptService) {
		this.tastAttemptService = tastAttemptService;
	}

	// GET MAPPINGS

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'CO_TRAINER')")
	public ResponseEntity<List<TaskAttemptDTO>> getAllTaskAttempts(@RequestParam(required = false) UserRole role,
			@RequestParam(required = false) Long taskId, @RequestParam(required = false) Long userId) {
		return ResponseEntity.ok(tastAttemptService.getAllTaskAttempts(taskId, userId, role));
	}

	@GetMapping("/{attemptId}")
	@PreAuthorize("hasAnyRole('ADMIN', 'CO_TRAINER')")
	public ResponseEntity<TaskAttemptDTO> getTaskAttemptByTaskId(@PathVariable Long attemptId) {
		return ResponseEntity.ok(tastAttemptService.getTaskAttemptByTaskId(attemptId));
	}

	// POST MAPPINGS

	@PostMapping
	@PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
	public ResponseEntity<TaskAttemptDTO> createTaskAttemptByTaskType(@Valid @RequestBody TaskAttemptDTO dto) {
		return ResponseEntity.status(201).body(tastAttemptService.createTaskAttemptByTaskType(dto));
	}

	// PUT MAPPINGS

	@PutMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'CO_TRAINER')")
	public ResponseEntity<TaskAttemptDTO> updateTaskAttempt(@Valid @RequestBody TaskAttemptUpdateDTO dto) {
		return ResponseEntity.ok(tastAttemptService.updateTaskAttempt(dto));
	}

	// DELETE MAPPINGS

	@DeleteMapping("/{attemptId}")
	@PreAuthorize("hasAnyRole('ADMIN','CO_TRAINER')")
	public ResponseEntity<Void> deleteById(@PathVariable Long attemptId) {
		tastAttemptService.deleteById(attemptId);
		return ResponseEntity.noContent().build();
	}

}
