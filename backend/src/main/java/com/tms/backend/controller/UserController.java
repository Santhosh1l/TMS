package com.tms.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tms.backend.dto.UserDTO;
import com.tms.backend.dto.UserUpdateDTO;
import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;
import com.tms.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/tms/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	// GET MAPPINGS

	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
	@GetMapping
	public ResponseEntity<List<UserDTO>> getAllusers(
			@RequestParam(required = false) UserRole role,
			@RequestParam(required = false) UserStatus status) {
		return ResponseEntity.ok(userService.getAllUsers(role, status));
	}

	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
	@GetMapping("/{userId}")
	public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
		return ResponseEntity.ok(userService.getUserById(userId));
	}



	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping
	public ResponseEntity<UserDTO> updateUserById(@Valid @RequestBody UserUpdateDTO data) {
		return ResponseEntity.ok(userService.updateUserById(data)); 
	}

	// DELETE MAPPINGS

	@PreAuthorize("hasRole('ADMIN')")
	@DeleteMapping("/{userId}")
	public ResponseEntity<String> deleteById(@PathVariable Long userId) {
		return ResponseEntity.ok(userService.deleteById(userId));
	}

}
