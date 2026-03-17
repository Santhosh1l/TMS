
package com.tms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.tms.backend.model.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByIdAndIsDeleteFalse(Long attendanceId);

    Optional<Attendance> findBySession_IdAndUser_IdAndIsDeleteFalse(Long sessionId, Long userId);

    List<Attendance> findAllBySession_IdAndIsDeleteFalse(Long sessionId);

    List<Attendance> findAllBySession_IdAndUser_IdAndIsDeleteFalse(Long sessionId, Long userId);

    List<Attendance> findAllBySession_Course_IdAndIsDeleteFalse(Long courseId);

	List<Attendance> findAllByIsDeleteFalse();
}
