package com.tms.backend.service.implementation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
	public Page<UserDTO> getAllUsers(UserRole role, UserStatus status, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());

		// Determine if the current user is a MANAGER (scope to their team only)
		Long managerId = null;
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
			User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
			if (currentUser != null && currentUser.getRole() == UserRole.ROLE_MANAGER) {
				managerId = currentUser.getId();
			}
		}

		Page<User> resultPage;

		if (managerId != null) {
			// Manager-scoped: only their direct reports
			if (role != null && status != null) {
				resultPage = userRepository.findAllByIsDeleteFalseAndManager_IdAndRoleAndStatus(managerId, role, status, pageable);
			} else if (role != null) {
				resultPage = userRepository.findAllByIsDeleteFalseAndManager_IdAndRole(managerId, role, pageable);
			} else if (status != null) {
				resultPage = userRepository.findAllByIsDeleteFalseAndManager_IdAndStatus(managerId, status, pageable);
			} else {
				resultPage = userRepository.findAllByIsDeleteFalseAndManager_Id(managerId, pageable);
			}
		} else {
			// Admin-scoped: all users
			if (role != null && status != null) {
				resultPage = userRepository.findAllByIsDeleteFalseAndRoleAndStatus(role, status, pageable);
			} else if (role != null) {
				resultPage = userRepository.findAllByIsDeleteFalseAndRole(role, pageable);
			} else if (status != null) {
				resultPage = userRepository.findAllByIsDeleteFalseAndStatus(status, pageable);
			} else {
				resultPage = userRepository.findAllByIsDeleteFalse(pageable);
			}
		}

		return resultPage.map(this::toDTO);
	}

	@Override
	public UserDTO getUserById(Long userId) {
		return toDTO(findActiveUser(userId));
	}

	@Override
	public UserDTO updateUserById(UserUpdateDTO data) {

		User user = findActiveUser(data.getUserId());

		if (data.getName() != null && !data.getName().isBlank()) {
			user.setName(data.getName().trim());
		}

		if (data.getEmail() != null && !data.getEmail().isBlank()) {

			userRepository.findByEmailAndIsDeleteFalse(data.getEmail())
					.filter(existing -> !existing.getId().equals(user.getId()))
					.ifPresent(u -> {
						throw new IllegalArgumentException("Email already in use");
					});

			user.setEmail(data.getEmail().trim());
		}

		if (data.getRole() != null) {
			user.setRole(data.getRole());
		}

		if (data.getStatus() != null) {
			user.setStatus(data.getStatus());
		}

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

		if (user.getStatus() == UserStatus.INACTIVE) {
			throw new IllegalStateException("User already deleted");
		}

		user.setStatus(UserStatus.INACTIVE);
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
