package com.tms.backend.dto;
import com.tms.backend.enums.CourseMemberStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeEnrollCompletedDTO {
	
	private Long enrollmentId;

    @NotNull(message = "status is required")
    private CourseMemberStatus status;
    
    @NotNull(message = "progressPercent is required")
    @Min(value = 0, message = "progressPercent must be at least 0")
    @Max(value = 100, message = "progressPercent must be at most 100")
    private Integer progressPercent;
    
    private LocalDate completionDate;
    
    @Positive(message = "certificateId must be a positive number")
    private Long certificateId;
    
}
