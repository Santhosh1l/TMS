package com.tms.backend.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateDTO {
	
	private Long certificateId;

    @NotNull(message = "enrollmentId is required")
    @Positive(message = "enrollmentId must be a positive number")
    private Long enrollmentId;
    
    @NotNull(message = "courseId is required")
    @Positive(message = "courseId must be a positive number")
    private Long courseId;
    
    private LocalDate issuedOn;
    
    @Size(max = 80, message = "templateId must be at most 80 characters")
    private String templateId;
   
}
