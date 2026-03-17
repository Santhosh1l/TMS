
package com.tms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tms.backend.enums.CourseMemberRole;
import com.tms.backend.model.Enrollment;


@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByCourse_IdAndUser_IdAndMemberRole(Long courseId, Long userId, CourseMemberRole memberRole);

    Optional<Enrollment> findByIdAndIsDeleteFalse(Long id);

    List<Enrollment> findAllByIsDeleteFalse();

    List<Enrollment> findAllByMemberRoleAndIsDeleteFalse(CourseMemberRole memberRole);

    List<Enrollment> findAllByCourse_IdAndIsDeleteFalse(Long courseId);

    List<Enrollment> findAllByCourse_IdAndMemberRoleAndIsDeleteFalse(Long courseId, CourseMemberRole memberRole);

    List<Enrollment> findAllByUser_IdAndMemberRoleAndIsDeleteFalse(Long userId, CourseMemberRole memberRole);
}
