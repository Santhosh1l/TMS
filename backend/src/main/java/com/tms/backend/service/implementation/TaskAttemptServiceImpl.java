package com.tms.backend.service.implementation;

import com.tms.backend.dto.TaskAttemptDTO;
import com.tms.backend.dto.TaskAttemptUpdateDTO;
import com.tms.backend.enums.TaskAttemptStatus;
import com.tms.backend.enums.UserRole;
import com.tms.backend.model.Task;
import com.tms.backend.model.TaskAttempt;
import com.tms.backend.model.User;
import com.tms.backend.repository.TaskAttemptRepository;
import com.tms.backend.repository.TaskRepository;
import com.tms.backend.repository.UserRepository;
import com.tms.backend.service.TaskAttemptService;

import jakarta.validation.Valid;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskAttemptServiceImpl implements TaskAttemptService {

    private final TaskAttemptRepository attemptRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskAttemptServiceImpl(TaskAttemptRepository attemptRepository,
                                  TaskRepository taskRepository,
                                  UserRepository userRepository) {
        this.attemptRepository = attemptRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<TaskAttemptDTO> getAllTaskAttempts(Long taskId, Long userId, UserRole role) {
        List<TaskAttempt> taskAttempts = attemptRepository.findAllByIsDeleteFalse();

        if (taskId != null) {
            taskAttempts = taskAttempts.stream()
                    .filter(ta -> ta.getTask() != null && taskId.equals(ta.getTask().getId()))
                    .collect(Collectors.toList());
        }
        if (userId != null) {
            taskAttempts = taskAttempts.stream()
                    .filter(ta -> ta.getUser() != null && userId.equals(ta.getUser().getId()))
                    .collect(Collectors.toList());
        }
        if (role != null) {
            taskAttempts = taskAttempts.stream()
                    .filter(ta -> ta.getUser() != null && role.equals(ta.getUser().getRole()))
                    .collect(Collectors.toList());
        }

        return taskAttempts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TaskAttemptDTO getTaskAttemptByTaskId(Long attemptId) {
        TaskAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));
        return toDTO(attempt);
    }

    @Override
    public TaskAttemptDTO createTaskAttemptByTaskType(@Valid TaskAttemptDTO dto) {
        if (dto.getType().name().equals("QUIZ"))       return createQuizAttempt(dto);
        if (dto.getType().name().equals("ASSIGNMENT")) return createAssignmentAttempt(dto);
        throw new IllegalArgumentException("Enter valid task type: QUIZ or ASSIGNMENT");
    }

    @Override
    public TaskAttemptDTO updateTaskAttempt(TaskAttemptUpdateDTO dto) {
        TaskAttempt attempt = attemptRepository.findByIdAndIsDeleteFalse(dto.getAttemptId())
                .orElseThrow(() -> new IllegalArgumentException("TaskAttempt not found: " + dto.getAttemptId()));

        if (dto.getStatus() != null)         attempt.setStatus(dto.getStatus());
        if (dto.getAttemptedAt() != null)    attempt.setAttemptedAt(dto.getAttemptedAt());
        if (dto.getScore() != null)          attempt.setScore(dto.getScore());
        if (dto.getFeedback() != null)       attempt.setFeedback(dto.getFeedback());
        if (dto.getTotal() != null)          attempt.setTotal(dto.getTotal());
        if (dto.getAttachmentLink() != null) attempt.setAttachmentLink(dto.getAttachmentLink());

        if (attempt.getStatus() == TaskAttemptStatus.SUBMITTED && attempt.getAttemptedAt() == null) {
            attempt.setAttemptedAt(LocalDate.now());
        }

        return toDTO(attemptRepository.save(attempt));
    }

    @Override
    public void deleteById(Long attemptId) {
        TaskAttempt data = attemptRepository.findByIdAndIsDeleteFalse(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("No attempt found with id: " + attemptId));
        data.setDelete(Boolean.TRUE);
        attemptRepository.save(data);
    }

    // ── Quiz Attempt ────────────────────────────────────────────────────────────
    private TaskAttemptDTO createQuizAttempt(TaskAttemptDTO dto) {
        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + dto.getTaskId()));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + dto.getUserId()));

        if (user.getRole() != UserRole.ROLE_EMPLOYEE) {
            throw new IllegalArgumentException("Only Employees can submit attempts");
        }

        if (attemptRepository.findByTask_IdAndUser_IdAndIsDeleteFalse(dto.getTaskId(), dto.getUserId()).isPresent()) {
            throw new IllegalArgumentException("Attempt already exists for this task and user");
        }

        if (dto.getScore() == null || dto.getTotal() == null) {
            throw new IllegalArgumentException("Quiz attempt requires score and total");
        }
        if (dto.getTotal() <= 0 || dto.getScore() < 0 || dto.getScore() > dto.getTotal()) {
            throw new IllegalArgumentException("Invalid score/total values");
        }

        LocalDate attemptedAt = dto.getAttemptedAt();
        if (dto.getStatus() == TaskAttemptStatus.SUBMITTED && attemptedAt == null) {
            attemptedAt = LocalDate.now();
        }

        TaskAttempt attempt = TaskAttempt.builder()
                .task(task)
                .taskType(task.getType())   // FIX #3: use task's type not dto
                .user(user)
                .attemptedAt(attemptedAt)
                .status(dto.getStatus())
                .score(dto.getScore())
                .total(dto.getTotal())
                .attachmentLink(dto.getAttachmentLink())
                .feedback(dto.getFeedback())
                .build();

        return toDTO(attemptRepository.save(attempt));
    }

    // ── Assignment Attempt ──────────────────────────────────────────────────────
    private TaskAttemptDTO createAssignmentAttempt(TaskAttemptDTO dto) {
        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + dto.getTaskId()));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + dto.getUserId()));

        if (user.getRole() != UserRole.ROLE_EMPLOYEE) {
            throw new IllegalArgumentException("Only Employees can submit attempts");
        }

        if (attemptRepository.findByTask_IdAndUser_IdAndIsDeleteFalse(dto.getTaskId(), dto.getUserId()).isPresent()) {
            throw new IllegalArgumentException("Attempt already exists for this task and user");
        }

        LocalDate attemptedAt = dto.getAttemptedAt();
        if (dto.getStatus() == TaskAttemptStatus.SUBMITTED && attemptedAt == null) {
            attemptedAt = LocalDate.now();
        }

        TaskAttempt attempt = TaskAttempt.builder()
                .task(task)
                .taskType(task.getType())   // FIX #3: use task's type not dto
                .user(user)
                .attemptedAt(attemptedAt)
                .status(dto.getStatus())
                .score(dto.getScore())
                .total(dto.getTotal())
                .attachmentLink(dto.getAttachmentLink())
                .feedback(dto.getFeedback())
                .build();

        return toDTO(attemptRepository.save(attempt));
    }

    // ── toDTO ───────────────────────────────────────────────────────────────────
    private TaskAttemptDTO toDTO(TaskAttempt a) {
        return TaskAttemptDTO.builder()
                .taskAttemptId(a.getId())
                .taskId(a.getTask() != null ? a.getTask().getId() : null)
                .userId(a.getUser() != null ? a.getUser().getId() : null)
                .type(a.getTaskType())          // FIX #3: was missing — map taskType → type
                .attemptedAt(a.getAttemptedAt())
                .status(a.getStatus())
                .score(a.getScore())
                .total(a.getTotal())
                .attachmentLink(a.getAttachmentLink())
                .feedback(a.getFeedback())
                .build();
    }
}
