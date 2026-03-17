package com.tms.backend.service;

import java.util.List;

import com.tms.backend.dto.TaskDTO;
import com.tms.backend.dto.TaskUpdateDTO;
import com.tms.backend.enums.TaskStatus;
import com.tms.backend.enums.TaskType;

public interface TaskService {

	List<TaskDTO> getAllTasks(Long sessionId, Long courseId, Long userId, TaskStatus status, TaskType type);

	TaskDTO getTaskById(Long taskId);

	TaskDTO createTaskByTaskType(TaskDTO dto);

	TaskDTO updateTask(TaskUpdateDTO dto);

	void deleteTask(Long taskId);

}
