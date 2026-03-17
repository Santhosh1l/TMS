package com.tms.backend.dto;

import com.tms.backend.enums.CourseMode;
import com.tms.backend.enums.CourseType;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDTO {
	
	//id
	private Long courseId;
	@NotBlank(message = "title is required")
	@Size(max = 140, message = "title must be at most 140 characters")
	private String title;
	
	@NotNull(message = "type is required")
	private CourseType type;
	
	@Size(max = 10_000, message = "description must be at most 10,000 characters")
	private String description;
	
	@Min(value = 1, message = "durationHours must be at least 1 hour")
	@Max(value = 10_000, message = "durationHours must be at most 10,000 hours")
	private Integer durationHours;
	
	@NotNull(message = "mode is required")
	private CourseMode mode;
	
	@Size(max = 200, message = "prerequisites must be at most 200 characters")
	private String prerequisites;
	
	@Size(max = 80, message = "certificateTemplateId must be at most 80 characters")
	private String certificateTemplateId;

}