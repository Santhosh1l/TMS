
package com.tms.backend.dto;

import com.tms.backend.enums.CourseMemberRole;
import com.tms.backend.enums.CourseMemberStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCourseEnrollDTO {
	
	//id
	private Long enrollmentId;

    @NotNull(message = "userId is required")
    @Positive(message = "userId must be a positive number")
    private Long userId;

    @NotNull(message = "courseId is required")
    @Positive(message = "courseId must be a positive number")
    private Long courseId;

    @NotNull(message = "memberRole is required")
    private CourseMemberRole memberRole;

    @NotNull(message = "status is required")
    private CourseMemberStatus status;

    private LocalDate activeFrom;

    private LocalDate activeTo;

    @Positive(message = "assignedByUserId must be a positive number")
    private Long assignedByUserId;

    @PastOrPresent(message = "assignedOn must be in the past or present")
    private LocalDate assignedOn;

    private LocalDate completionDate;

}
