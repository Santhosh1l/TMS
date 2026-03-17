
package com.tms.backend.model;

import com.tms.backend.enums.TaskStatus;
import com.tms.backend.enums.TaskType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "task", indexes = { @Index(name = "idx_task_course_id", columnList = "course_id"),
		@Index(name = "idx_task_status", columnList = "status"), @Index(name = "idx_task_type", columnList = "type"),
		@Index(name = "idx_session_is_delete", columnList = "is_delete") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Task {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	@Column(name = "task_id")
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "type", nullable = false, length = 20)
	private TaskType type;

	@Column(name = "title", nullable = false, length = 160)
	private String title;

	@Column(name = "created_at", nullable = false)
	@CreationTimestamp
	private LocalDate createdAt;

	@Column(name = "scheduled_date")
	private LocalDate scheduledDate;

	@Column(name = "start_time")
	private LocalTime startTime;

	@Column(name = "end_time")
	private LocalTime endTime;

	@Column(name = "duration_minutes")
	private Integer durationMinutes;

	@Column(name = "instruction_link", length = 200)
	private String instructionLink;

	@Column(name = "weekly_mandatory")
	@Builder.Default
	private Boolean weeklyMandatory = Boolean.FALSE;

	@Column(name = "submission_deadline")
	private LocalDate submissionDeadline;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 20)
	@Builder.Default
	private TaskStatus status = TaskStatus.SCHEDULED;

	@Column(name = "total_marks")
	private Integer totalMarks;

	@Column(name = "platform", length = 60)
	private String platform;

	@Column(name = "is_delete", nullable = false)
	@Builder.Default
	private boolean isDelete = false;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "course_id", nullable = false, foreignKey = @ForeignKey(name = "fk_task_course"))
	private Course course;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "session_id", foreignKey = @ForeignKey(name = "fk_task_session"))
	private Session session;

	@OneToMany(mappedBy = "task", orphanRemoval = false, cascade = CascadeType.ALL)
	@Builder.Default
	private List<TaskAttempt> attempts = new ArrayList<>();

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "created_by_user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_task_created_by_user"))
	private User createdBy;

}
