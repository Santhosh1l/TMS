package com.tms.backend.service.implementation;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tms.backend.dto.AttendanceDTO;
import com.tms.backend.enums.AttendanceStatus;
import com.tms.backend.enums.UserStatus;
import com.tms.backend.model.Attendance;
import com.tms.backend.model.Session;
import com.tms.backend.model.User;
import com.tms.backend.repository.AttendanceRepository;
import com.tms.backend.repository.SessionRepository;
import com.tms.backend.repository.UserRepository;
import com.tms.backend.service.AttendanceService;

@Service
public class AttendanceServiceImpl implements AttendanceService {

	private final AttendanceRepository attendanceRepository;
	private final SessionRepository sessionRepository;
	private final UserRepository userRepository;

	public AttendanceServiceImpl(AttendanceRepository attendanceRepository,
								 SessionRepository sessionRepository,
								 UserRepository userRepository) {
		this.attendanceRepository = attendanceRepository;
		this.sessionRepository = sessionRepository;
		this.userRepository = userRepository;
	}

	// ─────────────────────────────────────────────────────────────
	// GET ALL
	// ─────────────────────────────────────────────────────────────
	@Override
	public List<AttendanceDTO> getAllAttendances(Long sessionId, Long courseId, UserStatus status) {

		List<Attendance> list = attendanceRepository
				.findAllBySession_IdAndIsDeleteFalse(sessionId);

		if (courseId != null) {
			list = list.stream()
					.filter(a -> a.getSession() != null
							&& a.getSession().getCourse() != null
							&& courseId.equals(a.getSession().getCourse().getId()))
					.collect(Collectors.toList());
		}

		if (status != null) {
			list = list.stream()
					.filter(a -> a.getUser() != null
							&& status.equals(a.getUser().getStatus()))
					.collect(Collectors.toList());
		}

		return list.stream()
				.map(this::toDTO)
				.collect(Collectors.toList());
	}

	@Override
	public AttendanceDTO getAttendanceById(Long attendanceId) {

		Attendance entity = attendanceRepository
				.findByIdAndIsDeleteFalse(attendanceId)
				.orElseThrow(() ->
						new IllegalArgumentException("No attendance with ID: " + attendanceId));

		return toDTO(entity);
	}


	@Override
	public AttendanceDTO createAttendance(AttendanceDTO dto) {


		Session session = sessionRepository
				.findByIdAndIsDeleteFalse(dto.getSessionId())
				.orElseThrow(() -> new IllegalArgumentException(
						"No Session found (or deleted) with ID: " + dto.getSessionId()));


		User user = userRepository.findById(dto.getUserId())
				.orElseThrow(() -> new IllegalArgumentException(
						"No User found with ID: " + dto.getUserId()));


		if (user.getStatus() != UserStatus.ACTIVE || user.isDelete()) {
			throw new IllegalArgumentException(
					"User is inactive or deleted. Cannot mark attendance.");
		}


		Optional<Attendance> existing = attendanceRepository
				.findBySession_IdAndUser_IdAndIsDeleteFalse(
						dto.getSessionId(), dto.getUserId());

		Attendance entity;

		if (existing.isPresent()) {
			entity = existing.get();

			if (dto.getStatus() != null)
				entity.setStatus(dto.getStatus());

			if (dto.getCheckInTime() != null)
				entity.setCheckInTime(dto.getCheckInTime());

			if (dto.getCheckOutTime() != null)
				entity.setCheckOutTime(dto.getCheckOutTime());

			if (dto.getRemarks() != null)
				entity.setRemarks(dto.getRemarks());

		} else {
			entity = Attendance.builder()
					.session(session)
					.user(user)
					.status(dto.getStatus())
					.checkInTime(dto.getCheckInTime())
					.checkOutTime(dto.getCheckOutTime())
					.remarks(dto.getRemarks())
					.build();
		}

		return toDTO(attendanceRepository.save(entity));
	}

	@Override
	public AttendanceDTO updateAttendance(AttendanceDTO dto) {

		Attendance entity = attendanceRepository
				.findByIdAndIsDeleteFalse(dto.getAttentanceId())
				.orElseThrow(() -> new IllegalArgumentException(
						"No attendance with ID: " + dto.getAttentanceId()));

		if (dto.getStatus() != null)
			entity.setStatus(dto.getStatus());

		if (dto.getCheckInTime() != null)
			entity.setCheckInTime(dto.getCheckInTime());

		if (dto.getCheckOutTime() != null)
			entity.setCheckOutTime(dto.getCheckOutTime());

		if (dto.getRemarks() != null)
			entity.setRemarks(dto.getRemarks());

		return toDTO(attendanceRepository.save(entity));
	}


	@Override
	public AttendanceDTO updateAttendanceStatus(Long attendanceId, AttendanceStatus status) {

		Attendance entity = attendanceRepository
				.findByIdAndIsDeleteFalse(attendanceId)
				.orElseThrow(() -> new IllegalArgumentException(
						"No attendance with ID: " + attendanceId));

		entity.setStatus(status);

		return toDTO(attendanceRepository.save(entity));
	}


	@Override
	public void deleteAttendanceById(Long attendanceId) {

		Attendance entity = attendanceRepository
				.findByIdAndIsDeleteFalse(attendanceId)
				.orElseThrow(() -> new IllegalArgumentException(
						"No attendance with ID: " + attendanceId));

		entity.setDelete(true);

		attendanceRepository.save(entity);
	}


	private AttendanceDTO toDTO(Attendance a) {
		return AttendanceDTO.builder()
				.attentanceId(a.getId()) // (keep consistent with your DTO)
				.sessionId(a.getSession() != null ? a.getSession().getId() : null)
				.userId(a.getUser() != null ? a.getUser().getId() : null)
				.status(a.getStatus())
				.checkInTime(a.getCheckInTime())
				.checkOutTime(a.getCheckOutTime())
				.remarks(a.getRemarks())
				.build();
	}
}