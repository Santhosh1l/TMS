
package com.tms.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.tms.backend.enums.TaskStatus;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskUpdateDTO {

	@NotNull(message = "Task ID is required")
	private Long taskId;

	private TaskStatus status;

	@Size(max = 200, message = "Instruction link must be at most 200 characters")
	@Pattern(regexp = "^(https?://).+", message = "Instruction link must be a valid HTTP/HTTPS URL")
	private String link;

	@Positive(message = "Duration must be a positive number")
	@Max(value = 1440, message = "Duration must not exceed 1440 minutes (24 hours)")
	private Integer durationMinutes;

	@Positive(message = "Total marks must be a positive number")
	@Max(value = 10000, message = "Total marks must not exceed 10000")
	private Integer totalMarks;

	@Size(min = 1, max = 160, message = "Title must be between 1 and 160 characters")
	private String title;

	private LocalDate scheduledDate;

	private LocalDate submissionDeadline;

	private LocalTime startTime;

	private LocalTime endTime;

}
