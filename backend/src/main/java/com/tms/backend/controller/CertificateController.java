package com.tms.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tms.backend.dto.CertificateDTO;
import com.tms.backend.enums.TaskStatus;
import com.tms.backend.enums.TaskType;
import com.tms.backend.service.CertificateService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tms/certificates")
public class CertificateController {

	private final CertificateService certificateService;

	public CertificateController(CertificateService certificateService) {
		this.certificateService = certificateService;
	}
	
	//GET MAPPINGS
	
	@GetMapping
	public ResponseEntity<List<CertificateDTO>> getAllCertificatesByEnrollmentId(
			@RequestParam(required = false) Long enrollmentId,
			@RequestParam(required = false) Long courseId,
			@RequestParam(required = false) Long userId) {
		return ResponseEntity.ok(certificateService.getAllCertificates(enrollmentId, courseId, userId)); 
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<CertificateDTO> getCertificateById(@PathVariable Long id) {
		return ResponseEntity.ok(certificateService.getCertificateById(id));
	}

	//POST MAPPINGS

	@PostMapping
	public ResponseEntity<CertificateDTO> issueCertificateForEnrollment(@Valid @RequestBody CertificateDTO dto) {

		return ResponseEntity.status(201).body(certificateService.issueCertificateForEnrollment(dto)); 
	}

	//DELETE MAPPINGS

	@PreAuthorize("hasAnyAuthority('ADMIN','TRAINER','MANAGER')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		certificateService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
