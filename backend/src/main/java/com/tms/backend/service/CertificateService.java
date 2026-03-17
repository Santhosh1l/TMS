package com.tms.backend.service;

import java.util.List;

import com.tms.backend.dto.CertificateDTO;

public interface CertificateService {
	
	List<CertificateDTO> getAllCertificates(Long enrollmentId, Long courseId, Long userId);

	CertificateDTO getCertificateById(Long certificateId);

	CertificateDTO issueCertificateForEnrollment(CertificateDTO dto);

	void deleteById(Long certificateId);

}
