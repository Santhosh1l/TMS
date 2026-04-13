package com.tms.backend.service;

import org.springframework.data.domain.Page;

import com.tms.backend.dto.UserDTO;
import com.tms.backend.dto.UserUpdateDTO;
import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;

public interface UserService {

	Page<UserDTO> getAllUsers(UserRole role, UserStatus status, int page, int size);

	UserDTO getUserById(Long userId);

	UserDTO updateUserById(UserUpdateDTO data);

	String deleteById(Long userId);

}
