
package com.tms.backend.model;
import jakarta.persistence.Index;
import com.tms.backend.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "attendance",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_attendance_session_user", columnNames = {"session_id", "user_id"})
        },
        indexes = {
                @Index(name = "idx_attendance_session_id", columnList = "session_id"),
                @Index(name = "idx_attendance_user_id", columnList = "user_id"),
                @Index(name = "idx_attendance_status", columnList = "status")
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AttendanceStatus status;

    @Column(name = "check_in_time")
    private LocalDate checkInTime;

    @Column(name = "check_out_time")
    private LocalDate checkOutTime;

    @Column(length = 200)
    private String remarks;

    @Column(name = "is_delete", nullable = false)
    @Builder.Default
    private boolean isDelete = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_attendance_session"))
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_attendance_user"))
    private User user;


}
