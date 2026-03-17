package com.tms.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tms.backend.dto.SessionDTO;
import com.tms.backend.enums.SessionType;
import com.tms.backend.enums.UserRole;
import com.tms.backend.dto.SessionDTO;
import com.tms.backend.service.SessionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tms/sessions")
public class SessionController {

	private final SessionService sessionService;

	public SessionController(SessionService sessionService) {
		this.sessionService = sessionService;
	}

	// GET MAPPINGS

	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<SessionDTO>> getAllSession(@RequestParam(required = false) Long trainerId,
			@RequestParam(required = false) Long courseId, @RequestParam(required = false) Long taskId,
			@RequestParam(defaultValue = "false") boolean recurring,
			@RequestParam(defaultValue = "false") boolean active) {
		return ResponseEntity.status(200)
				.body(sessionService.getAllSessions(trainerId, courseId, taskId, recurring, active));
	}

	@GetMapping("/{sessionId}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<SessionDTO> getSessionById(@PathVariable Long sessionId) {
		return ResponseEntity.ok(sessionService.getSessionById(sessionId));
	}

	// POST MAPPINGS

	@PostMapping
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	public ResponseEntity<SessionDTO> createSession(@Valid @RequestBody SessionDTO req) {
		return ResponseEntity.status(201).body(sessionService.createSession(req));
	}

	// UPDATE MAPPINGS

	@PutMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<SessionDTO> updateSession(@Valid @RequestBody SessionDTO req) {
		return ResponseEntity.ok(sessionService.updateSession(req));
	}

	@PatchMapping("/{sessionId}")
	@PreAuthorize("hasAnyRole('ADMIN','TRAINER')")
	public ResponseEntity<SessionDTO> updateRecurringStatus(@PathVariable Long sessionId) {
		return ResponseEntity.ok(sessionService.updateRecurringStatus(sessionId));
	}

	// DELETE MAPPINGS

	@DeleteMapping("/{sessionId}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<String> deleteSession(@PathVariable Long sessionId) {
		return ResponseEntity.ok(sessionService.deleteSession(sessionId));
	}

}
