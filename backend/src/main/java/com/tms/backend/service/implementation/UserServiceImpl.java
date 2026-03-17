package com.tms.backend.service.implementation;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.tms.backend.dto.UserDTO;
import com.tms.backend.dto.UserUpdateDTO;
import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;
import com.tms.backend.model.User;
import com.tms.backend.repository.UserRepository;
import com.tms.backend.service.UserService;

@Service
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;

	public UserServiceImpl(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public List<UserDTO> getAllUsers(UserRole role, UserStatus status) {

		// FIX: original logic was broken — when role == ADMIN it loaded ALL users
		// (including deleted), for other roles it loaded non-deleted users.
		// Correct behaviour: always start with non-deleted users, then filter.
		List<User> all = userRepository.findAllByIsDeleteFalse();

		if (role != null) {
			all = all.stream()
					.filter(u -> u.getRole() == role)
					.collect(Collectors.toList());
		}

		if (status != null) {
			all = all.stream()
					.filter(u -> u.getStatus() == status)
					.collect(Collectors.toList());
		}

		return all.stream().map(this::toDTO).collect(Collectors.toList());
	}

	@Override
	public UserDTO getUserById(Long userId) {
		return toDTO(findActiveUser(userId));
	}

	@Override
	public UserDTO updateUserById(UserUpdateDTO data) {
		User user = findActiveUser(data.getUserId());

		if (data.getRole() != null)   user.setRole(data.getRole());
		if (data.getStatus() != null) user.setStatus(data.getStatus());

		if (data.getDepartment() != null && !data.getDepartment().isBlank()) {
			user.setDepartment(data.getDepartment().trim());
		}
		if (data.getLocation() != null && !data.getLocation().isBlank()) {
			user.setLocation(data.getLocation().trim());
		}

		if (data.getManagerId() != null) {
			if (data.getManagerId().equals(data.getUserId())) {
				throw new IllegalArgumentException("A user cannot be their own manager");
			}

			User manager = userRepository.findById(data.getManagerId())
					.orElseThrow(() -> new IllegalArgumentException(
							"Manager not found: " + data.getManagerId()));

			// FIX: check ROLE_MANAGER and ROLE_ADMIN (enum values with prefix)
			if (manager.getRole() != UserRole.ROLE_MANAGER
					&& manager.getRole() != UserRole.ROLE_ADMIN) {
				throw new IllegalArgumentException(
						"Manager must have role ROLE_MANAGER or ROLE_ADMIN");
			}
			if (manager.getStatus() == UserStatus.INACTIVE) {
				throw new IllegalArgumentException("Manager must be ACTIVE");
			}

			user.setManager(manager);
		}

		return toDTO(userRepository.save(user));
	}

	@Override
	public String deleteById(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UsernameNotFoundException(
						"No User found with given ID: " + userId));

		// Soft delete: mark inactive and set delete flag
		user.setStatus(UserStatus.INACTIVE);
		user.setDelete(Boolean.TRUE);
		userRepository.save(user);

		return "User successfully deleted";
	}

	// ── Helpers ─────────────────────────────────────────────────────────────────

	private User findActiveUser(Long userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new UsernameNotFoundException(
						"No User found with given ID: " + userId));
	}

	private UserDTO toDTO(User u) {
		return UserDTO.builder()
				.userId(u.getId())
				.name(u.getName())
				.email(u.getEmail())
				.role(u.getRole())
				.status(u.getStatus())
				.department(u.getDepartment())
				.location(u.getLocation())
				.managerId(u.getManager() != null ? u.getManager().getId() : null)
				.build();
	}
}
