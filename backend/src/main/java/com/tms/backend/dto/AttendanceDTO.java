package com.tms.backend.dto;
import com.tms.backend.enums.AttendanceStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDTO {
	//id
	private Long attentanceId;
	
    @NotNull(message = "sessionId is required")
    @Positive(message = "sessionId must be a positive number")
    private Long sessionId;
    
    @NotNull(message = "userId is required")
    @Positive(message = "userId must be a positive number")
    private Long userId;
    
    @NotNull(message = "status is required")
    private AttendanceStatus status;
    
    private LocalDate checkInTime;
    
    private LocalDate checkOutTime;
    
    @Size(max = 200, message = "remarks must be at most 200 characters")
    private String remarks;
 
}
