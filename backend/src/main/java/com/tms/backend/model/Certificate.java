package com.tms.backend.model;

import jakarta.persistence.Index;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "certificate", indexes = {
		@Index(name = "idx_certificate_enrollment_id", columnList = "course_member_id"),
		@Index(name = "idx_certificate_course_id", columnList = "course_id"),
		@Index(name = "idx_certificate_is_delete", columnList = "is_delete") })

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Certificate {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "course_member_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_certificate_enrollment"))
	private Enrollment enrollment;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "course_id", nullable = false, foreignKey = @ForeignKey(name = "fk_certificate_course"))
	private Course course;

	@Column(name = "issued_on")
	private LocalDate issuedOn;

	@Column(name = "template_id", length = 80)
	private String templateId;

	@Column(name = "is_delete", nullable = false)
	@Builder.Default
	private boolean isDelete = false;

}
