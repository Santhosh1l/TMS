package com.tms.backend.service.implementation;

import com.tms.backend.dto.AuthDTO;
import com.tms.backend.dto.LoginDTO;
import com.tms.backend.dto.RegisterDTO;
import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;
import com.tms.backend.model.User;
import com.tms.backend.repository.UserRepository;
import com.tms.backend.service.AuthUserService;
import com.tms.backend.util.JwtUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class AuthUserServiceImpl implements AuthUserService {

	private final PasswordEncoder passwordEncoder;
	private final JwtUtils jwtUtils;
	private final UserRepository userRepository;

	public AuthUserServiceImpl(PasswordEncoder passwordEncoder, JwtUtils jwtUtils,
							   UserRepository userRepository) {
		super();
		this.passwordEncoder = passwordEncoder;
		this.jwtUtils = jwtUtils;
		this.userRepository = userRepository;
	}

	@Override
	public AuthDTO login(LoginDTO data) {
		String email = data.getEmail().trim().toLowerCase();

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

		if (user.getStatus() == UserStatus.INACTIVE ) {
			throw new IllegalStateException("Account is " + user.getStatus().name().toLowerCase()
					+ ". Please contact your administrator.");
		}

		if (!passwordEncoder.matches(data.getPassword(), user.getPassword())) {
			throw new BadCredentialsException("Invalid credentials");
		}

		// FIX: include "authorities" so Spring Security and the frontend
		// can both read the role from the JWT correctly
		Map<String, Object> claims = Map.of(
				"sub",         user.getEmail(),
				"uid",         user.getId(),
				"role",        user.getRole().name(),
				"authorities", List.of(Map.of("authority", user.getRole().name()))
		);

		String token  = jwtUtils.generateKey(user.getEmail(), claims);
		Date expiresAt = jwtUtils.parseToken(token).getBody().getExpiration();

		return new AuthDTO(user.getId(), token, expiresAt);
	}

	@Override
	public AuthDTO register(RegisterDTO data) {
		String email = data.getEmail().trim().toLowerCase();

		if (userRepository.existsByEmail(email)) {
			throw new IllegalArgumentException("Email already registered");
		}

		// FIX: default role to ROLE_EMPLOYEE (matches enum value)
		UserRole role = data.getRole() != null ? data.getRole() : UserRole.ROLE_EMPLOYEE;

		// FIX: default status to ACTIVE if not provided
		UserStatus status = data.getStatus() != null ? data.getStatus() : UserStatus.ACTIVE;

		String passwordHash = passwordEncoder.encode(data.getPassword());

		User newUser = userRepository.save(
				User.builder()
						.name(data.getName().trim())
						.email(email)
						.role(role)
						.password(passwordHash)
						.status(status)
						.department(data.getDepartment())
						.build());

		// FIX: register also includes authorities in token (same as login)
		Map<String, Object> claims = Map.of(
				"sub",         newUser.getEmail(),
				"uid",         newUser.getId(),
				"role",        newUser.getRole().name(),
				"authorities", List.of(Map.of("authority", newUser.getRole().name()))
		);

		String token  = jwtUtils.generateKey(newUser.getEmail(), claims);
		Date expiresAt = jwtUtils.parseToken(token).getBody().getExpiration();

		return new AuthDTO(newUser.getId(), token, expiresAt);
	}
}
