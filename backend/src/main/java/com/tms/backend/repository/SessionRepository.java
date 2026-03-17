package com.tms.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tms.backend.model.Session;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

	Optional<Session> findByIdAndIsDeleteFalse(Long sessionId);

	List<Session> findAllByIsDeleteFalse();

	List<Session> findAllByCourse_IdAndIsDeleteFalse(Long courseId);

	List<Session> findAllByCourse_IdInAndIsDeleteFalse(Set<Long> courseIds);

}
