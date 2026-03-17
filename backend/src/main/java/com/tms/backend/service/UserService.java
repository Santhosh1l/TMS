package com.tms.backend.service;

import java.util.List;

import com.tms.backend.dto.UserDTO;
import com.tms.backend.dto.UserUpdateDTO;
import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;

public interface UserService {

	List<UserDTO> getAllUsers(UserRole role, UserStatus status);

	UserDTO getUserById(Long userId);

	UserDTO updateUserById(UserUpdateDTO data);

	String deleteById(Long userId);

}
