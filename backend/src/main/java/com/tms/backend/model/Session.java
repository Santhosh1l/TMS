package com.tms.backend.model;

import com.tms.backend.enums.SessionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "session", indexes = { @Index(name = "idx_session_course_id", columnList = "course_id"),
		@Index(name = "idx_session_session_date", columnList = "session_date"),
		@Index(name = "idx_session_type", columnList = "session_type") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Session {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "course_id", nullable = false, foreignKey = @ForeignKey(name = "fk_session_course"))
	private Course course;

	@Column(nullable = false, length = 140)
	private String title;

	@Column(name = "session_date")
	private LocalDate sessionDate;

	@Column(name = "start_time")
	private LocalTime startTime;

	@Column(name = "end_time")
	private LocalTime endTime;

	@Enumerated(EnumType.STRING)
	@Column(name = "session_type", length = 30)
	private SessionType sessionType;

	@Column(name = "delivery_link", length = 200)
	private String deliveryLink;

	@Column(name = "recurring")
	@Builder.Default
	private boolean recurring = false;

	@Column(name = "recording_link", length = 200)
	private String recordingLink;

	@Column(length = 60)
	private String room;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "trainer_id", foreignKey = @ForeignKey(name = "fk_session_trainer"))
	private User trainer;

	@OneToMany(mappedBy = "session", orphanRemoval = false, cascade = CascadeType.ALL)
	private List<Task> task;

	@OneToMany(mappedBy = "session", orphanRemoval = false, cascade = CascadeType.ALL)
	@Builder.Default
	private List<Attendance> attendances = new ArrayList<>();

	@Column(name = "is_delete", nullable = false)
	@Builder.Default
	private boolean isDelete = false;

}
