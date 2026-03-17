package com.tms.backend.model;

import jakarta.persistence.Index;

import com.tms.backend.enums.TaskAttemptStatus;
import com.tms.backend.enums.TaskType;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "task_attempt",

		indexes = { @Index(name = "idx_task_attempt_task_id", columnList = "task_id"),
				@Index(name = "idx_task_attempt_user_id", columnList = "user_id"),
				@Index(name = "idx_task_attempt_status", columnList = "status"),
				@Index(name = "idx_task_attempt_is_delete", columnList = "is_delete") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class TaskAttempt {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Long id;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "task_type", length = 20, nullable = false)
	private TaskType taskType;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "task_id", nullable = false, foreignKey = @ForeignKey(name = "fk_task_attempt_task"))
	private Task task;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_task_attempt_user"))
	private User user;

	@Column(name = "attempted_at")
	@CreationTimestamp
	private LocalDate attemptedAt;
	
	private String attachmentLink;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 20, nullable = false)
	@Builder.Default
	private TaskAttemptStatus status = TaskAttemptStatus.NOT_STARTED;

	@Column(name = "score")
	private Integer score;
	
	private Integer total;

	@Column(columnDefinition = "TEXT")
	private String feedback;

	@Column(name = "is_delete", nullable = false)
	@Builder.Default
	private boolean isDelete = false;

}
