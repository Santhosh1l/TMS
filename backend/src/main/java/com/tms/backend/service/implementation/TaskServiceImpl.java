package com.tms.backend.service.implementation;

import com.tms.backend.dto.TaskDTO;
import com.tms.backend.dto.TaskUpdateDTO;
import com.tms.backend.enums.TaskStatus;
import com.tms.backend.enums.TaskType;
import com.tms.backend.model.Course;
import com.tms.backend.model.Task;
import com.tms.backend.model.User;
import com.tms.backend.repository.CourseRepository;
import com.tms.backend.repository.TaskRepository;
import com.tms.backend.repository.UserRepository;
import com.tms.backend.service.TaskService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

	private final TaskRepository taskRepository;
	private final CourseRepository courseRepository;
	private final UserRepository userRepository;

	public TaskServiceImpl(TaskRepository taskRepository, CourseRepository courseRepository,
						   UserRepository userRepository) {
		super();
		this.taskRepository = taskRepository;
		this.courseRepository = courseRepository;
		this.userRepository = userRepository;
	}

	@Override
	public List<TaskDTO> getAllTasks(Long sessionId, Long courseId, Long userId, TaskStatus status, TaskType type) {

		List<Task> tasks = taskRepository.findAllByIsDeleteFalse();

		if (sessionId != null) {
			tasks = tasks.stream()
					.filter(t -> t.getSession() != null && sessionId.equals(t.getSession().getId()))
					.collect(Collectors.toList());
		}
		if (courseId != null) {
			tasks = tasks.stream()
					.filter(t -> t.getCourse() != null && courseId.equals(t.getCourse().getId()))
					.collect(Collectors.toList());
		}
		if (userId != null) {
			tasks = tasks.stream()
					.filter(t -> t.getCreatedBy() != null && userId.equals(t.getCreatedBy().getId()))
					.collect(Collectors.toList());
		}
		if (type != null) {
			tasks = tasks.stream()
					.filter(t -> t.getType() == type)
					.collect(Collectors.toList());
		}
		// FIX #2: was checking sessionId != null — should check status != null
		if (status != null) {
			tasks = tasks.stream()
					.filter(t -> t.getStatus() == status)
					.collect(Collectors.toList());
		}

		return tasks.stream()
				.map(this::toDTO)
				.collect(Collectors.toList());
	}

	@Override
	public TaskDTO getTaskById(Long taskId) {
		Task task = taskRepository.findByIdAndIsDeleteFalse(taskId)
				.orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
		return toDTO(task);
	}

	@Override
	public TaskDTO createTaskByTaskType(TaskDTO dto) {
		if (dto.getType().name().equals("QUIZ"))
			return createQuiz(dto);
		if (dto.getType().name().equals("ASSIGNMENT"))
			return createAssignment(dto);
		throw new IllegalArgumentException("Enter valid type of task: QUIZ or ASSIGNMENT");
	}

	@Override
	public TaskDTO updateTask(TaskUpdateDTO dto) {
		Task task = taskRepository.findById(dto.getTaskId())
				.orElseThrow(() -> new IllegalArgumentException("Task not found: " + dto.getTaskId()));

		if (dto.getStatus() != null)           task.setStatus(dto.getStatus());
		if (dto.getLink() != null)             task.setInstructionLink(dto.getLink());
		if (dto.getDurationMinutes() != null)  task.setDurationMinutes(dto.getDurationMinutes());
		if (dto.getTotalMarks() != null)       task.setTotalMarks(dto.getTotalMarks());
		if (dto.getStartTime() != null)        task.setStartTime(dto.getStartTime());
		if (dto.getEndTime() != null)          task.setEndTime(dto.getEndTime());
		if (dto.getScheduledDate() != null)    task.setScheduledDate(dto.getScheduledDate());
		if (dto.getSubmissionDeadline() != null) task.setSubmissionDeadline(dto.getSubmissionDeadline());
		if (dto.getTitle() != null)            task.setTitle(dto.getTitle());

		Task saved = taskRepository.save(task);
		return toDTO(saved);
	}

	@Override
	public void deleteTask(Long taskId) {
		Task task = taskRepository.findByIdAndIsDeleteFalse(taskId)
				.orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
		task.setDelete(Boolean.TRUE);
		taskRepository.save(task);
	}

	private TaskDTO createQuiz(TaskDTO dto) {
		Course course = courseRepository.findById(dto.getCourseId())
				.orElseThrow(() -> new IllegalArgumentException("Course not found: " + dto.getCourseId()));

		User creator = resolveCurrentUserOrThrow();

		// FIX #1: was checking "CO_TRAINER" — enum value is "ROLE_CO_TRAINER"
		// Also allow ADMIN to create tasks
		String roleName = creator.getRole() != null ? creator.getRole().name() : "";
		if (!roleName.equals("ROLE_CO_TRAINER") && !roleName.equals("ROLE_ADMIN")) {
			throw new IllegalStateException("Only Co-Trainer or Admin can create tasks");
		}

		Task task = Task.builder()
				.course(course)
				.type(TaskType.QUIZ)
				.title(dto.getTitle())
				.scheduledDate(dto.getScheduledDate())
				.startTime(dto.getStartTime())
				.endTime(dto.getEndTime())
				.durationMinutes(dto.getDurationMinutes())
				.platform(dto.getPlatform())
				.instructionLink(dto.getInstructionLink())
				.totalMarks(dto.getTotalMarks())
				.status(dto.getStatus())
				.weeklyMandatory(Boolean.TRUE.equals(dto.getWeeklyMandatory()))
				.submissionDeadline(dto.getSubmissionDeadline())
				.createdBy(creator)
				.build();

		return toDTO(taskRepository.save(task));
	}

	private TaskDTO createAssignment(TaskDTO dto) {
		Course course = courseRepository.findById(dto.getCourseId())
				.orElseThrow(() -> new IllegalArgumentException("Course not found: " + dto.getCourseId()));

		User creator = resolveCurrentUserOrThrow();

		// FIX #1: consistent role check — also allow ADMIN
		String roleName = creator.getRole() != null ? creator.getRole().name() : "";
		if (!roleName.equals("ROLE_CO_TRAINER") && !roleName.equals("ROLE_ADMIN")) {
			throw new IllegalStateException("Only Co-Trainer or Admin can create tasks");
		}

		Task task = Task.builder()
				.course(course)
				.type(TaskType.ASSIGNMENT)
				.title(dto.getTitle())
				.scheduledDate(dto.getScheduledDate())
				.startTime(dto.getStartTime())
				.endTime(dto.getEndTime())
				.weeklyMandatory(Boolean.TRUE.equals(dto.getWeeklyMandatory()))
				.durationMinutes(dto.getDurationMinutes())
				.submissionDeadline(dto.getSubmissionDeadline())
				.instructionLink(dto.getInstructionLink())
				.platform(dto.getPlatform())
				.status(dto.getStatus())
				.totalMarks(dto.getTotalMarks())
				.createdBy(creator)
				.build();

		return toDTO(taskRepository.save(task));
	}

	private TaskDTO toDTO(Task task) {
		return TaskDTO.builder()
				.taskId(task.getId())
				.courseId(task.getCourse() != null ? task.getCourse().getId() : null)
				.type(task.getType())
				.title(task.getTitle())
				.createdAt(task.getCreatedAt())
				.scheduledDate(task.getScheduledDate())
				.startTime(task.getStartTime())
				.endTime(task.getEndTime())
				.durationMinutes(task.getDurationMinutes())
				.instructionLink(task.getInstructionLink())
				.weeklyMandatory(task.getWeeklyMandatory())
				.submissionDeadline(task.getSubmissionDeadline())
				.platform(task.getPlatform())
				.status(task.getStatus())
				.totalMarks(task.getTotalMarks())
				.build();
	}

	public User resolveCurrentUserOrThrow() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || auth.getName() == null) {
			throw new IllegalStateException("No authenticated user");
		}
		return userRepository.findByEmail(auth.getName())
				.orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + auth.getName()));
	}
}
