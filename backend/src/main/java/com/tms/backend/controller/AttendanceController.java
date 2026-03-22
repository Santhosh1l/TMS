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
import org.springframework.web.service.annotation.PatchExchange;

import com.tms.backend.dto.AttendanceDTO;
import com.tms.backend.enums.AttendanceStatus;
import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;
import com.tms.backend.service.AttendanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tms/session/{sessionId}/attendance")
public class AttendanceController {

	private final AttendanceService attendanceService;

	public AttendanceController(AttendanceService attendanceService) {

		this.attendanceService = attendanceService;
	}


	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN','TRAINER','CO_TRAINER')")
	public ResponseEntity<List<AttendanceDTO>> getAllAttendance(@PathVariable Long sessionId,
			@RequestParam(required = false) Long courseId, @RequestParam(required = false) UserStatus status) {
		return ResponseEntity.ok(attendanceService.getAllAttendances(sessionId, courseId, status));
	}

	@GetMapping("/{attendanceId}")
	@PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
	public ResponseEntity<AttendanceDTO> getAttendanceById(@PathVariable Long attendanceId) {

		return ResponseEntity.status(200).body(attendanceService.getAttendanceById(attendanceId));
	}



	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<AttendanceDTO> createAttendance(@PathVariable Long sessionId,
			@Valid @RequestBody AttendanceDTO dto) {
		dto.setSessionId(sessionId); // ensure consistency with path
		return ResponseEntity.status(201).body(attendanceService.createAttendance(dto));
	}



	@PutMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<AttendanceDTO> updateAttendance(@PathVariable Long sessionId,
			@Valid @RequestBody AttendanceDTO dto) {
		dto.setSessionId(sessionId); // optional (for safety)
		return ResponseEntity.ok(attendanceService.updateAttendance(dto));
	}

	@PatchMapping("/{attendanceId}")
	@PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
	public ResponseEntity<AttendanceDTO> updateAttendanceStatus(@PathVariable Long attendanceId,
			@RequestParam AttendanceStatus status) {
		return ResponseEntity.ok(attendanceService.updateAttendanceStatus(attendanceId, status));
	}


	@DeleteMapping("/{attendanceId}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> deleteAttendanceById(@PathVariable Long attendanceId) {
		attendanceService.deleteAttendanceById(attendanceId);
		return ResponseEntity.noContent().build();
	}

}
