package com.tms.backend.service;

import java.util.List;

import com.tms.backend.dto.SessionDTO;

public interface SessionService {

	List<SessionDTO> getAllSessions(Long trainerId, Long courseId, Long taskId, boolean recurring, boolean active);

	SessionDTO getSessionById(Long sessionId);

	SessionDTO createSession(SessionDTO dto);

	SessionDTO updateSession(SessionDTO dto);

	SessionDTO updateRecurringStatus(Long sessionId);

	String deleteSession(Long sessionId);

}
