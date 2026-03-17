
package com.tms.backend.dto;

import com.tms.backend.enums.TaskStatus;
import com.tms.backend.enums.TaskType;
import lombok.*;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskDTO {
	
	
    private Long taskId;

    @NotNull(message = "courseId is required")
    private Long courseId;

    @NotNull(message = "type is required")
    private TaskType type;

    
   
    private LocalTime startTime;

   
    private LocalTime endTime;
    
    @NotBlank(message = "title is required")
    @Size(max = 160, message = "title must be at most 160 characters")
    private String title;
    
    private LocalDate createdAt;

    @NotNull(message = "scheduledDate is required")
    @FutureOrPresent(message = "scheduledDate must be today or in the future")
    private LocalDate scheduledDate;

    @NotNull(message = "weeklyMandatory is required")
    private Boolean weeklyMandatory;

    @NotNull(message = "durationMinutes is required")
    @Positive(message = "durationMinutes must be a positive number")
    private Integer durationMinutes;

    @NotNull(message = "submissionDeadline is required")
    @FutureOrPresent(message = "submissionDeadline must be in the future or present")
    private LocalDate submissionDeadline;

    @NotBlank(message = "instructionLink is required")
    @URL(message = "instructionLink must be a valid URL")
    @Size(max = 200, message = "instructionLink must be at most 200 characters")
    private String instructionLink;
    
    @NotNull(message = "totalMarks is required")
    @PositiveOrZero(message = "totalMarks must be zero or positive")
    private Integer totalMarks;

    @NotBlank(message = "platform is required")
    @Size(max = 60, message = "platform must be at most 60 characters")
    private String platform;

    @NotNull(message = "status is required")
    private TaskStatus status;

}
