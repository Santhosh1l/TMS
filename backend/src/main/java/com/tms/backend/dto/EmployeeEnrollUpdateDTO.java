package com.tms.backend.dto;
import com.tms.backend.enums.CourseMemberStatus;
import jakarta.validation.constraints.*;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeEnrollUpdateDTO {
	
	//id
    private Long courseMemberId;
    
    @NotNull(message = "status is required")
    private CourseMemberStatus status;
    
    @NotNull(message = "progressPercent is required")
    @Min(value = 0, message = "progressPercent must be at least 0")
    @Max(value = 100, message = "progressPercent must be at most 100")
    private Integer progressPercent;
  
}
