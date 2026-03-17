package com.tms.backend.service;

import java.util.List;

import com.tms.backend.dto.CourseDTO;

public interface CourseService {

	List<CourseDTO> getAllCourses(Long employeeId, Long trainerId, boolean active);

	CourseDTO getCourseById(Long courseId);

	CourseDTO addCourse(CourseDTO dto);

	CourseDTO updateCourse(CourseDTO dto);

	String deleteById(Long courseId);

}
