package com.tms.backend.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import com.tms.backend.dto.CourseDTO;
import com.tms.backend.enums.TaskStatus;
import com.tms.backend.enums.TaskType;
import com.tms.backend.service.CourseService;

import jakarta.validation.Valid;

@RestController

@RequestMapping(value = "/api/tms/courses", produces = "application/json")
public class CourseController {

	private final CourseService courseService;

	public CourseController(CourseService courseService) {

		this.courseService = courseService;
	}

	// GET MAPPINGS

	@GetMapping

	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<CourseDTO>> getAllCourses(
			@RequestParam(required = false) Long employeeId,
			@RequestParam(required = false) Long trainerId, 
			@RequestParam(defaultValue = "true") boolean active) {
		return ResponseEntity.status(200).body(courseService.getAllCourses(employeeId, trainerId, active));

	}

	@GetMapping("/{id}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
		return ResponseEntity.ok(courseService.getCourseById(id));
	}

	// POST MAPPINGS

	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping
	public ResponseEntity<CourseDTO> addCourse(@Valid @RequestBody CourseDTO dto) {
		return ResponseEntity.status(201).body(courseService.addCourse(dto));

	}

	// UPDATE MAPPINGS

	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping
	public ResponseEntity<CourseDTO> updateCourse(@Valid @RequestBody CourseDTO dto) {
		return ResponseEntity.status(200).body(courseService.updateCourse(dto));
	}

	// DELETE MAPPINGS

	@PreAuthorize("hasRole('ADMIN')")
	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteById(@PathVariable Long id) {
		return ResponseEntity.ok(courseService.deleteById(id));
	}

}
