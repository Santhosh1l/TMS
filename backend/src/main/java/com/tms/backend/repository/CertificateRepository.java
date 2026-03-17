
package com.tms.backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tms.backend.dto.CertificateDTO;
import com.tms.backend.model.Certificate;
import com.tms.backend.model.Enrollment;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {

	Collection<Certificate> findAllByEnrollment_IdAndIsDeleteFalse(Long enrollmentId);

	List<Certificate> findAllByIsDeleteFalse();

	Optional<Certificate> findByIdAndIsDeleteFalse(Long certificateId);

	boolean existsByEnrollment_IdAndIsDeleteFalse(Long enrollmentId);

}
