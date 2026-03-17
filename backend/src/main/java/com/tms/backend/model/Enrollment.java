package com.tms.backend.model;

import jakarta.persistence.Index;
import com.tms.backend.enums.CourseMemberRole;
import com.tms.backend.enums.CourseMemberStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "course_member", indexes = { @Index(name = "idx_course_member_course_id", columnList = "course_id"),
		@Index(name = "idx_course_member_user_id", columnList = "user_id"),
		@Index(name = "idx_course_member_status", columnList = "status"),
		@Index(name = "idx_course_member_is_delete", columnList = "is_delete") }, uniqueConstraints = @UniqueConstraint(name = "uk_course_member_course_user_role", columnNames = {
				"course_id", "user_id", "member_role" }))

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Enrollment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "member_role", nullable = false, length = 20)
	private CourseMemberRole memberRole;

	@Column(name = "active_from")
	private LocalDate activeFrom;

	@Column(name = "active_to")
	private LocalDate activeTo;

	@Column(name = "assigned_on")
	private LocalDate assignedOn;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	@Builder.Default
	private CourseMemberStatus status = CourseMemberStatus.ASSIGNED;

	@Column(name = "progress_percent")
	private Integer progressPercent;

	@Column(name = "completion_date")
	private LocalDate completionDate;

	@OneToOne(mappedBy = "enrollment", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
	private Certificate certificate;

	@Column(name = "is_delete", nullable = false)
	@Builder.Default
	private boolean isDelete = false;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "course_id", nullable = false, foreignKey = @ForeignKey(name = "fk_course_member_course"))
	private Course course;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_course_member_user"))
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_by_user_id", foreignKey = @ForeignKey(name = "fk_course_member_assigned_by_user"))
	private User assignedBy;

}
