
package com.tms.backend.service;

import java.util.List;

import com.tms.backend.dto.AttendanceDTO;
import com.tms.backend.enums.AttendanceStatus;
import com.tms.backend.enums.UserStatus;

public interface AttendanceService {

	List<AttendanceDTO> getAllAttendances(Long sessionId, Long courseId, UserStatus status);

	AttendanceDTO getAttendanceById(Long attendanceId);

	AttendanceDTO createAttendance(AttendanceDTO dto);

	AttendanceDTO updateAttendance(AttendanceDTO dto);

	AttendanceDTO updateAttendanceStatus(Long attendanceId, AttendanceStatus status);

	void deleteAttendanceById(Long attendanceId);

}
