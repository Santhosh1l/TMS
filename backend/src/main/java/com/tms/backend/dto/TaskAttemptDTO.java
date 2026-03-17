package com.tms.backend.dto;

import java.time.LocalDate;

import com.tms.backend.enums.TaskAttemptStatus;
import com.tms.backend.enums.TaskType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskAttemptDTO {

	private Long taskAttemptId;

	@NotNull(message = "taskId is required")
	private Long taskId;

	@NotNull(message = "userId is required")
	private Long userId;

	@NotNull(message = "status is required")
	private TaskAttemptStatus status;
	
	@NotNull(message = "task type is required")
	private TaskType type;

	@Positive(message = "total must be a positive number")
	private Integer total;

	private String attachmentLink;

	@PastOrPresent(message = "attemptedAt must be in the past or present")
	private LocalDate attemptedAt;

	private String feedback;

	@PositiveOrZero(message = "score must be zero or positive")
	private Integer score;

}
