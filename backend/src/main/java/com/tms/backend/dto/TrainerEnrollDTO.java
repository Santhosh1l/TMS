
package com.tms.backend.dto;

import com.tms.backend.enums.CourseMemberRole;
import com.tms.backend.enums.CourseMemberStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerEnrollDTO {
    private Long enrollmentId;
    private Long userId;
    private Long courseId;
    private CourseMemberRole memberRole;
    private CourseMemberStatus status;
    private LocalDate activeFrom;
    private LocalDate activeTo;
}
