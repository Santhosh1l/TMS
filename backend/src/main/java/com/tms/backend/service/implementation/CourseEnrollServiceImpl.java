package com.tms.backend.service.implementation;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tms.backend.dto.EmployeeEnrollUpdateDTO;
import com.tms.backend.dto.UserCourseEnrollDTO;
import com.tms.backend.enums.CourseMemberRole;
import com.tms.backend.enums.CourseMemberStatus;
import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;
import com.tms.backend.model.Course;
import com.tms.backend.model.Enrollment;
import com.tms.backend.model.User;
import com.tms.backend.repository.CourseRepository;
import com.tms.backend.repository.EnrollmentRepository;
import com.tms.backend.repository.UserRepository;
import com.tms.backend.service.CourseEnrollService;

import jakarta.validation.Valid;

@Service
public class CourseEnrollServiceImpl implements CourseEnrollService {

	private final CourseRepository courseRepository;
	private final UserRepository userRepository;
	private final EnrollmentRepository enrollmentRepository;

	public CourseEnrollServiceImpl(EnrollmentRepository enrollmentRepository,
								   CourseRepository courseRepository,
								   UserRepository userRepository) {
		this.enrollmentRepository = enrollmentRepository;
		this.courseRepository = courseRepository;
		this.userRepository = userRepository;
	}

	@Override
	public List<UserCourseEnrollDTO> getAllEnrollments(Long courseId, Long userId, CourseMemberRole role) {
		List<Enrollment> list = enrollmentRepository.findAllByCourse_IdAndIsDeleteFalse(courseId);

		if (role != null) {
			list = list.stream()
					.filter(e -> e.getMemberRole() == role)
					.collect(Collectors.toList());
		}

		if (userId != null) {
			list = list.stream()
					.filter(e -> userId.equals(e.getUser().getId()))
					.collect(Collectors.toList());
		}

		return list.stream().map(this::toDTO).collect(Collectors.toList());
	}

	@Override
	public UserCourseEnrollDTO getEnrollmentById(Long enrollmentId) {
		Enrollment cm = enrollmentRepository.findByIdAndIsDeleteFalse(enrollmentId)
				.orElseThrow(() -> new IllegalArgumentException("Enrollment not found: " + enrollmentId));
		return toDTO(cm);
	}

	@Override
	public UserCourseEnrollDTO enrollUserCourse(@Valid UserCourseEnrollDTO dto) {
		if (dto.getMemberRole() == CourseMemberRole.ROLE_TRAINER
				|| dto.getMemberRole() == CourseMemberRole.ROLE_CO_TRAINER) {
			return assignTrainer(dto);
		}
		if (dto.getMemberRole() == CourseMemberRole.ROLE_EMPLOYEE) {
			return enrollEmployee(dto);
		}
		throw new IllegalArgumentException("Invalid Member Role: " + dto.getMemberRole());
	}

	@Override
	public UserCourseEnrollDTO updateProgress(EmployeeEnrollUpdateDTO data) {
		Enrollment cm = enrollmentRepository.findByIdAndIsDeleteFalse(data.getCourseMemberId())
				.orElseThrow(() -> new IllegalArgumentException("Enrollment not found: " + data.getCourseMemberId()));

		cm.setStatus(data.getStatus());
		cm.setProgressPercent(data.getProgressPercent());

		if (cm.getStatus() == CourseMemberStatus.COMPLETED) {
			if (cm.getCompletionDate() == null) {
				cm.setCompletionDate(LocalDate.now());
			}
			if (cm.getProgressPercent() != null && cm.getProgressPercent() < 100) {
				cm.setProgressPercent(100);
			}
		}

		return toDTO(enrollmentRepository.save(cm));
	}

	@Override
	public void deleteById(Long enrollmentId) {
		Enrollment data = enrollmentRepository.findByIdAndIsDeleteFalse(enrollmentId)
				.orElseThrow(() -> new IllegalArgumentException("No Enrollment ID Found: " + enrollmentId));
		data.setDelete(true);
		enrollmentRepository.save(data);
	}

	// ── Helper: Enroll Employee ─────────────────────────────────────────────────
	private UserCourseEnrollDTO enrollEmployee(UserCourseEnrollDTO data) {
		Course course = courseRepository.findById(data.getCourseId())
				.orElseThrow(() -> new IllegalArgumentException("Course not found: " + data.getCourseId()));

		User user = userRepository.findById(data.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("User not found: " + data.getUserId()));

		User assignedBy = userRepository.findById(data.getAssignedByUserId())
				.orElseThrow(() -> new IllegalArgumentException("AssignedBy user not found: " + data.getAssignedByUserId()));

		if (!(assignedBy.getRole() == UserRole.ROLE_MANAGER || assignedBy.getRole() == UserRole.ROLE_ADMIN)) {
			throw new IllegalArgumentException("assignedBy must have role MANAGER or ADMIN");
		}

		if (assignedBy.getStatus() == UserStatus.INACTIVE) {
			throw new IllegalArgumentException("assignedBy must be ACTIVE");
		}

		if (enrollmentRepository.existsByCourse_IdAndUser_IdAndMemberRole(
				data.getCourseId(), data.getUserId(), CourseMemberRole.ROLE_EMPLOYEE)) {
			throw new IllegalArgumentException("Employee already enrolled in this course");
		}

		Enrollment enroll = Enrollment.builder()
				.course(course)
				.user(user)
				.memberRole(CourseMemberRole.ROLE_EMPLOYEE)
				.assignedBy(assignedBy)
				.assignedOn(data.getAssignedOn() != null ? data.getAssignedOn() : LocalDate.now())
				.activeFrom(data.getActiveFrom())
				.activeTo(data.getActiveTo())
				.status(data.getStatus() != null ? data.getStatus() : CourseMemberStatus.ASSIGNED)
				.completionDate(data.getCompletionDate())
				.progressPercent(0)
				.build();

		return toDTO(enrollmentRepository.save(enroll));
	}

	// ── Helper: Assign Trainer / Co-Trainer ────────────────────────────────────
	private UserCourseEnrollDTO assignTrainer(UserCourseEnrollDTO data) {
		Course course = courseRepository.findById(data.getCourseId())
				.orElseThrow(() -> new IllegalArgumentException("Course not found: " + data.getCourseId()));

		User user = userRepository.findById(data.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("User not found: " + data.getUserId()));

		if (user.getStatus() == UserStatus.INACTIVE) {
			throw new IllegalArgumentException("User must be ACTIVE to be assigned as trainer");
		}

		if (enrollmentRepository.existsByCourse_IdAndUser_IdAndMemberRole(
				data.getCourseId(), data.getUserId(), data.getMemberRole())) {
			throw new IllegalArgumentException("Trainer/Co-Trainer already assigned to this course");
		}

		Enrollment cm = Enrollment.builder()
				.course(course)
				.user(user)
				.memberRole(data.getMemberRole())
				.activeFrom(data.getActiveFrom())
				.activeTo(data.getActiveTo())
				.status(data.getStatus() != null ? data.getStatus() : CourseMemberStatus.ASSIGNED)
				.progressPercent(0)
				.build();

		return toDTO(enrollmentRepository.save(cm));
	}

	// ── toDTO ───────────────────────────────────────────────────────────────────
	private UserCourseEnrollDTO toDTO(Enrollment e) {
		return UserCourseEnrollDTO.builder()
				.enrollmentId(e.getId())
				.userId(e.getUser() != null ? e.getUser().getId() : null)
				.courseId(e.getCourse() != null ? e.getCourse().getId() : null)
				.memberRole(e.getMemberRole())
				.status(e.getStatus())
				  // FIX #4: was missing
				.activeFrom(e.getActiveFrom())
				.activeTo(e.getActiveTo())
				.assignedByUserId(e.getAssignedBy() != null ? e.getAssignedBy().getId() : null)
				.assignedOn(e.getAssignedOn())
				.completionDate(e.getCompletionDate())
				.build();
	}
}
