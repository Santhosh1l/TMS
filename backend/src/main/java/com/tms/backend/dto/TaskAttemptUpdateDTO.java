
package com.tms.backend.dto;

import com.tms.backend.enums.TaskAttemptStatus;
import lombok.*;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskAttemptUpdateDTO {
	
	private Long attemptId;
    private TaskAttemptStatus status;

    @PastOrPresent(message = "attemptedAt must be in the past or present")
    private LocalDate attemptedAt;

    @PositiveOrZero(message = "score must be zero or positive")
    private Integer score;

    @Size(max = 10000, message = "feedback must be at most 10000 characters")
    private String feedback;
    
    private String attachmentLink;
    
    private Integer total;
    
    private boolean isDelete;
}
