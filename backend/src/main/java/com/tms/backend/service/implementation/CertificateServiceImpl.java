package com.tms.backend.service.implementation;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tms.backend.dto.CertificateDTO;
import com.tms.backend.enums.CourseMemberStatus;
import com.tms.backend.model.Certificate;
import com.tms.backend.model.Course;
import com.tms.backend.model.Enrollment;
import com.tms.backend.repository.CertificateRepository;
import com.tms.backend.repository.EnrollmentRepository;
import com.tms.backend.service.CertificateService;

@Service
public class CertificateServiceImpl implements CertificateService {

	private final CertificateRepository certificateRepo;
	private final EnrollmentRepository enrollmentRepo;

	public CertificateServiceImpl(CertificateRepository certificateRepo,
								  EnrollmentRepository enrollmentRepo) {
		this.certificateRepo = certificateRepo;
		this.enrollmentRepo = enrollmentRepo;
	}

	@Override
	public List<CertificateDTO> getAllCertificates(Long enrollmentId, Long courseId, Long userId) {
		if (enrollmentId != null) {
			return certificateRepo.findAllByEnrollment_IdAndIsDeleteFalse(enrollmentId)
					.stream().map(this::toDTO).collect(Collectors.toList());
		}
		if (courseId != null) {
			return certificateRepo.findAllByIsDeleteFalse().stream()
					.filter(c -> c.getCourse() != null && courseId.equals(c.getCourse().getId()))
					.map(this::toDTO).collect(Collectors.toList());
		}
		if (userId != null) {
			return certificateRepo.findAllByIsDeleteFalse().stream()
					.filter(c -> c.getEnrollment() != null
							&& c.getEnrollment().getUser() != null
							&& userId.equals(c.getEnrollment().getUser().getId()))
					.map(this::toDTO).collect(Collectors.toList());
		}
		return certificateRepo.findAllByIsDeleteFalse().stream()
				.map(this::toDTO).collect(Collectors.toList());
	}

	@Override
	public CertificateDTO getCertificateById(Long certificateId) {
		Certificate cert = certificateRepo.findByIdAndIsDeleteFalse(certificateId)
				.orElseThrow(() -> new IllegalArgumentException("Certificate not found: " + certificateId));
		return toDTO(cert);
	}

	@Override
	public CertificateDTO issueCertificateForEnrollment(CertificateDTO dto) {
		Enrollment enrollment = enrollmentRepo.findByIdAndIsDeleteFalse(dto.getEnrollmentId())
				.orElseThrow(() -> new IllegalArgumentException(
						"Enrollment not found: " + dto.getEnrollmentId()));

		// FIX #9: Validate enrollment is completed with 100% progress
		Integer progress = enrollment.getProgressPercent();
		if (enrollment.getStatus() != CourseMemberStatus.COMPLETED
				|| progress == null || progress < 100) {
			throw new IllegalArgumentException(
					"Cannot issue certificate: enrollment must be COMPLETED with 100% progress. "
							+ "Current status: " + enrollment.getStatus()
							+ ", progress: " + progress + "%");
		}

		// Prevent duplicate certificate
		if (certificateRepo.existsByEnrollment_IdAndIsDeleteFalse(dto.getEnrollmentId())) {
			throw new IllegalArgumentException(
					"Certificate already issued for enrollment: " + dto.getEnrollmentId());
		}

		Course course = enrollment.getCourse();
		if (course == null) {
			throw new IllegalStateException("Enrollment has no associated course");
		}

		Certificate cert = Certificate.builder()
				.enrollment(enrollment)
				.course(course)
				.issuedOn(dto.getIssuedOn() != null ? dto.getIssuedOn() : LocalDate.now())
				.templateId(dto.getTemplateId() != null
						? dto.getTemplateId()
						: course.getCertificateTemplateId())   // fallback to course template
				.build();

		return toDTO(certificateRepo.save(cert));
	}

	@Override
	public void deleteById(Long certificateId) {
		Certificate cert = certificateRepo.findByIdAndIsDeleteFalse(certificateId)
				.orElseThrow(() -> new IllegalArgumentException("Certificate not found: " + certificateId));
		cert.setDelete(Boolean.TRUE);
		certificateRepo.save(cert);
	}


	private CertificateDTO toDTO(Certificate c) {
		return CertificateDTO.builder()
				.certificateId(c.getId())
				.enrollmentId(c.getEnrollment() != null ? c.getEnrollment().getId() : null)
				.courseId(c.getCourse() != null ? c.getCourse().getId() : null)
				.issuedOn(c.getIssuedOn())
				.templateId(c.getTemplateId())
				.build();
	}
}
