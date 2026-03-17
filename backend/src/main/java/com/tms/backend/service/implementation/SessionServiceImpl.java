package com.tms.backend.service.implementation;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tms.backend.dto.SessionDTO;
import com.tms.backend.model.Course;
import com.tms.backend.model.Session;
import com.tms.backend.repository.CourseRepository;
import com.tms.backend.repository.SessionRepository;
import com.tms.backend.service.SessionService;

@Service
public class SessionServiceImpl implements SessionService {

	private final SessionRepository sessionRepository;
	private final CourseRepository courseRepository;

	public SessionServiceImpl(SessionRepository sessionRepository, CourseRepository courseRepository) {
		this.sessionRepository = sessionRepository;
		this.courseRepository = courseRepository;
	}

	@Override
	public List<SessionDTO> getAllSessions(Long trainerId, Long courseId, Long taskId,
										   boolean recurring, boolean active) {
		List<Session> sessions = sessionRepository.findAllByIsDeleteFalse();

		if (courseId != null) {
			sessions = sessions.stream()
					.filter(s -> s.getCourse() != null && courseId.equals(s.getCourse().getId()))
					.collect(Collectors.toList());
		}

		if (taskId != null) {
			sessions = sessions.stream()
					.filter(s -> s.getTask() != null
							&& s.getTask().stream().anyMatch(t -> taskId.equals(t.getId())))
					.collect(Collectors.toList());
		}

		if (trainerId != null) {
			sessions = sessions.stream()
					.filter(s -> s.getTrainer() != null && trainerId.equals(s.getTrainer().getId()))
					.collect(Collectors.toList());
		}

		if (recurring) {
			sessions = sessions.stream()
					.filter(Session::isRecurring)
					.collect(Collectors.toList());
		}

		if (active) {
			sessions = sessions.stream()
					.filter(s -> s.getSessionDate() != null
							&& !s.getSessionDate().isBefore(java.time.LocalDate.now()))
					.collect(Collectors.toList());
		}

		return sessions.stream().map(this::toDTO).collect(Collectors.toList());
	}

	@Override
	public SessionDTO getSessionById(Long sessionId) {
		Session entity = sessionRepository.findByIdAndIsDeleteFalse(sessionId)
				.orElseThrow(() -> new IllegalArgumentException("No session with ID: " + sessionId));
		return toDTO(entity);
	}

	@Override
	public SessionDTO createSession(SessionDTO dto) {
		Course course = courseRepository.findById(dto.getCourseId())
				.filter(c -> !c.isDelete())
				.orElseThrow(() -> new IllegalArgumentException(
						"Course not found (or deleted): " + dto.getCourseId()));

		Session entity = Session.builder()
				.course(course)
				.title(dto.getTitle() != null ? dto.getTitle().trim() : null)
				.sessionDate(dto.getSessionDate())
				.startTime(dto.getStartTime())
				.endTime(dto.getEndTime())
				.sessionType(dto.getSessionType())
				.deliveryLink(dto.getDeliveryLink())
				.recordingLink(dto.getRecordingLink())
				.room(dto.getRoom())
				.recurring(false)
				.build();

		return toDTO(sessionRepository.save(entity));
	}

	@Override
	public SessionDTO updateSession(SessionDTO dto) {
		Session entity = sessionRepository.findByIdAndIsDeleteFalse(dto.getSessionId())
				.orElseThrow(() -> new IllegalArgumentException("No session with ID: " + dto.getSessionId()));

		if (dto.getTitle() != null && !dto.getTitle().isBlank())
			entity.setTitle(dto.getTitle().trim());
		if (dto.getSessionDate() != null)   entity.setSessionDate(dto.getSessionDate());
		if (dto.getStartTime() != null)     entity.setStartTime(dto.getStartTime());
		if (dto.getEndTime() != null)       entity.setEndTime(dto.getEndTime());
		if (dto.getSessionType() != null)   entity.setSessionType(dto.getSessionType());
		if (dto.getDeliveryLink() != null)  entity.setDeliveryLink(dto.getDeliveryLink());
		if (dto.getRecordingLink() != null) entity.setRecordingLink(dto.getRecordingLink());
		if (dto.getRoom() != null)          entity.setRoom(dto.getRoom());

		if (dto.getCourseId() != null
				&& (entity.getCourse() == null || !dto.getCourseId().equals(entity.getCourse().getId()))) {
			Course newCourse = courseRepository.findById(dto.getCourseId())
					.filter(c -> !c.isDelete())
					.orElseThrow(() -> new IllegalArgumentException(
							"Course not found (or deleted): " + dto.getCourseId()));
			entity.setCourse(newCourse);
		}

		return toDTO(sessionRepository.save(entity));
	}

	@Override
	public SessionDTO updateRecurringStatus(Long sessionId) {
		Session session = sessionRepository.findByIdAndIsDeleteFalse(sessionId)
				.orElseThrow(() -> new IllegalArgumentException("No session found with ID: " + sessionId));
		session.setRecurring(!session.isRecurring());
		return toDTO(sessionRepository.save(session));
	}

	@Override
	public String deleteSession(Long sessionId) {
		Session entity = sessionRepository.findByIdAndIsDeleteFalse(sessionId)
				.orElseThrow(() -> new IllegalArgumentException("No session with ID: " + sessionId));
		entity.setDelete(true);
		sessionRepository.save(entity);
		return "Session successfully deleted";
	}

	// ── toDTO ───────────────────────────────────────────────────────────────────
	private SessionDTO toDTO(Session s) {
		return SessionDTO.builder()
				.sessionId(s.getId())
				.courseId(s.getCourse() != null ? s.getCourse().getId() : null)
				.title(s.getTitle())
				.sessionDate(s.getSessionDate())
				.startTime(s.getStartTime())
				.endTime(s.getEndTime())
				.sessionType(s.getSessionType())
				.deliveryLink(s.getDeliveryLink())
				.recordingLink(s.getRecordingLink())
				.room(s.getRoom())
				// FIX #6: recurring was missing from toDTO
				// NOTE: SessionDTO needs a 'recurring' field for this to work.
				// If your SessionDTO doesn't have it yet, add:
				//   private boolean recurring;
				// to SessionDTO, then uncomment the line below:
				// .recurring(s.isRecurring())
				.build();
	}
}
