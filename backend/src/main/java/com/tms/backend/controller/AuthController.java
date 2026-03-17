package com.tms.backend.controller;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tms.backend.dto.AuthDTO;
import com.tms.backend.dto.LoginDTO;
import com.tms.backend.dto.RegisterDTO;
import com.tms.backend.service.AuthUserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tms/auth")
public class AuthController {

	private final AuthUserService authUserService;

	public AuthController(AuthUserService authUserService) {
	
		this.authUserService = authUserService;
		
	}

	@PostMapping("/register")
	public ResponseEntity<AuthDTO> registerUser(@Valid @RequestBody RegisterDTO request) {
		return ResponseEntity.status(201).body(authUserService.register(request));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthDTO> loginUser(@Valid @RequestBody LoginDTO request) {
		return ResponseEntity.status(200).body(authUserService.login(request));
	}

}
