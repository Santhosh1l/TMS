package com.tms.backend.service;

import java.util.List;

import com.tms.backend.dto.EmployeeEnrollCompletedDTO;
import com.tms.backend.dto.EmployeeEnrollUpdateDTO;
import com.tms.backend.dto.TrainerEnrollDTO;
import com.tms.backend.dto.UserCourseEnrollDTO;
import com.tms.backend.enums.CourseMemberRole;
import com.tms.backend.enums.UserRole;

import jakarta.validation.Valid;

public interface CourseEnrollService {

	UserCourseEnrollDTO enrollUserCourse(@Valid UserCourseEnrollDTO dto);

	UserCourseEnrollDTO updateProgress(@Valid EmployeeEnrollUpdateDTO dto);

	void deleteById(Long enrollmentId);

	List<UserCourseEnrollDTO> getAllEnrollments(Long courseId, Long userId, CourseMemberRole role);

	UserCourseEnrollDTO getEnrollmentById(Long enrollmentId);
}