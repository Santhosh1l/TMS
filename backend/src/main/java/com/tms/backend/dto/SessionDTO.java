
package com.tms.backend.dto;

import com.tms.backend.enums.SessionType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

import org.hibernate.validator.constraints.URL;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionDTO {
	
    @Positive(message = "sessionId must be a positive number")
    private Long sessionId;

    @NotNull(message = "courseId is required")
    @Positive(message = "courseId must be a positive number")
    private Long courseId;

    @NotBlank(message = "title is required")
    @Size(max = 140, message = "title must be at most 140 characters")
    private String title;

    private LocalDate sessionDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @NotNull(message = "sessionType is required")
    private SessionType sessionType;

    @URL
    @Size(max = 200, message = "deliveryLink must be at most 200 characters")
    private String deliveryLink;

    @URL
    @Size(max = 200, message = "recordingLink must be at most 200 characters")
    private String recordingLink;


    @Size(max = 60, message = "room must be at most 60 characters")
    private String room;

}
