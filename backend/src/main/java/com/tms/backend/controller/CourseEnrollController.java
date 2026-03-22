
package com.tms.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.tms.backend.dto.EmployeeEnrollUpdateDTO;
import com.tms.backend.dto.UserCourseEnrollDTO;
import com.tms.backend.enums.CourseMemberRole;
import com.tms.backend.service.CourseEnrollService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tms/course/{courseId}/enrollments")
@Validated
public class CourseEnrollController {

	private final CourseEnrollService courseEnrollService;

	public CourseEnrollController(CourseEnrollService courseEnrollService) {
		this.courseEnrollService = courseEnrollService;
	}

	// GET ALL
	@GetMapping
	public ResponseEntity<List<UserCourseEnrollDTO>> getAllEnrollments(@PathVariable Long courseId,
			@RequestParam(required = false) Long userId, @RequestParam(required = false) CourseMemberRole role) {

		return ResponseEntity.ok(courseEnrollService.getAllEnrollments(courseId, userId, role));
	}

	// GET BY ID
	@GetMapping("/{enrollmentId}")
	@PreAuthorize("hasAnyRole('ADMIN','MANAGER','TRAINER')")
	public ResponseEntity<UserCourseEnrollDTO> getEnrollmentsById(@PathVariable Long enrollmentId) {
		return ResponseEntity.ok(courseEnrollService.getEnrollmentById(enrollmentId));
	}

	// CREATE
	@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
	@PostMapping
	public ResponseEntity<UserCourseEnrollDTO> enrollUser(
			@PathVariable Long courseId,
			@Valid @RequestBody UserCourseEnrollDTO dto
	) {
		dto.setCourseId(courseId);
		return ResponseEntity.status(201).body(courseEnrollService.enrollUserCourse(dto));
	}
	// UPDATE PROGRESS
	@PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
	@PutMapping
	public ResponseEntity<UserCourseEnrollDTO> updateProgress(@Valid @RequestBody EmployeeEnrollUpdateDTO dto) {
		return ResponseEntity.ok(courseEnrollService.updateProgress(dto));
	}

	// DELETE (SOFT DELETE)
	@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
	@DeleteMapping("/{enrollmentId}")
	public ResponseEntity<Void> deleteById(@PathVariable Long enrollmentId) {
		courseEnrollService.deleteById(enrollmentId);
		return ResponseEntity.noContent().build();
	}

}
