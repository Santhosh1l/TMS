package com.tms.backend.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tms.backend.model.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
	boolean existsByTitle(String title);

	boolean existsByTitleIgnoreCase(String title);

	Optional<Course> findByIdAndIsDeleteFalse(Long courseId);

	List<Course> findAllByIsDeleteFalse();
}
