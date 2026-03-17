
package com.tms.backend.service;

import java.util.List;

import com.tms.backend.dto.TaskAttemptDTO;
import com.tms.backend.dto.TaskAttemptUpdateDTO;
import com.tms.backend.enums.TaskAttemptStatus;
import com.tms.backend.enums.UserRole;

import jakarta.validation.Valid;

public interface TaskAttemptService {

	List<TaskAttemptDTO> getAllTaskAttempts(Long taskId, Long userId, UserRole role);
	
	TaskAttemptDTO getTaskAttemptByTaskId(Long attemptId);

	TaskAttemptDTO createTaskAttemptByTaskType(@Valid TaskAttemptDTO dto);

	TaskAttemptDTO updateTaskAttempt(TaskAttemptUpdateDTO dto);

	void deleteById(Long attemptId);

	
}
