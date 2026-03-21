package com.tms.backend.service.implementation;

import com.tms.backend.dto.CourseDTO;
import com.tms.backend.enums.CourseMemberRole;
import com.tms.backend.model.Course;
import com.tms.backend.repository.CourseRepository;
import com.tms.backend.repository.EnrollmentRepository;
import com.tms.backend.service.CourseService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

	private final EnrollmentRepository enrollmentRepository;
	private final CourseRepository courseRepository;

	public CourseServiceImpl(CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
		this.courseRepository = courseRepository;
		this.enrollmentRepository = enrollmentRepository;
	}

	@Override
	public List<CourseDTO> getAllCourses(Long employeeId, Long trainerId, boolean active) {


		List<Course> courses = courseRepository.findAll();
		if (Boolean.TRUE.equals(active)) {
			courses = courses.stream()
					.filter(c -> !c.isDelete()) // only active
					.collect(Collectors.toList());
		}


		if (employeeId != null) {
			courses = courses.stream()
					.filter(c -> c.getEnrollments() != null && c.getEnrollments().stream()
							.anyMatch(e -> !e.isDelete()
									&& e.getUser() != null
									&& employeeId.equals(e.getUser().getId())))
					.collect(Collectors.toList());
		}

		if (trainerId != null) {
			courses = courses.stream()
					.filter(c -> c.getEnrollments() != null && c.getEnrollments().stream()
							.anyMatch(e -> !e.isDelete()
									&& e.getUser() != null
									&& trainerId.equals(e.getUser().getId())
									&& (e.getMemberRole() == CourseMemberRole.ROLE_TRAINER
									|| e.getMemberRole() == CourseMemberRole.ROLE_CO_TRAINER)))
					.collect(Collectors.toList());
		}

		return courses.stream()
				.sorted(Comparator.comparing(Course::getId))
				.map(this::toDTO)
				.collect(Collectors.toList());
	}
	@Override
	public CourseDTO getCourseById(Long courseId) {
		Course data = courseRepository.findById(courseId)
				.filter(c -> !c.isDelete())
				.orElseThrow(() -> new IllegalArgumentException(
						"No Course with this ID (or deleted): " + courseId));
		return toDTO(data);
	}

	@Override
	public CourseDTO addCourse(CourseDTO dto) {
		String title = dto.getTitle().trim();

		if (courseRepository.existsByTitleIgnoreCase(title)) {
			throw new IllegalArgumentException("A course with this title already exists: " + title);
		}

		Course newCourse = Course.builder()
				.title(title)
				.type(dto.getType())
				.description(dto.getDescription())
				.durationHours(dto.getDurationHours())
				.mode(dto.getMode())
				.prerequisites(dto.getPrerequisites())
				.certificateTemplateId(dto.getCertificateTemplateId())
				.build();

		return toDTO(courseRepository.save(newCourse));
	}

	@Override
	public CourseDTO updateCourse(CourseDTO dto) {
		Course course = courseRepository.findById(dto.getCourseId())
				.filter(c -> !c.isDelete())
				.orElseThrow(() -> new IllegalArgumentException(
						"No Course with this ID (or deleted): " + dto.getCourseId()));

		if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
			String newTitle = dto.getTitle().trim();
			if (!newTitle.equalsIgnoreCase(course.getTitle())
					&& courseRepository.existsByTitleIgnoreCase(newTitle)) {
				throw new IllegalArgumentException("Another course already exists with title: " + newTitle);
			}
			course.setTitle(newTitle);
		}
		if (dto.getType() != null)                   course.setType(dto.getType());
		if (dto.getMode() != null)                   course.setMode(dto.getMode());
		if (dto.getDurationHours() != null)          course.setDurationHours(dto.getDurationHours());
		if (dto.getDescription() != null)            course.setDescription(dto.getDescription());
		if (dto.getPrerequisites() != null)          course.setPrerequisites(dto.getPrerequisites());
		if (dto.getCertificateTemplateId() != null)  course.setCertificateTemplateId(dto.getCertificateTemplateId());

		return toDTO(courseRepository.save(course));
	}

	@Override
	public String deleteById(Long courseId) {
		Course course = courseRepository.findById(courseId)
				.orElseThrow(() -> new IllegalArgumentException("No Course Found: " + courseId));
		course.setDelete(Boolean.TRUE);
		courseRepository.save(course);
		return "Course successfully deleted";
	}

	private CourseDTO toDTO(Course c) {
		return CourseDTO.builder()
				.courseId(c.getId())
				.title(c.getTitle())
				.type(c.getType())
				.description(c.getDescription())
				.durationHours(c.getDurationHours())
				.mode(c.getMode())
				.prerequisites(c.getPrerequisites())
				.certificateTemplateId(c.getCertificateTemplateId())
				.build();
	}
}
