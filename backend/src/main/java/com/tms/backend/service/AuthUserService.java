package com.tms.backend.service;

import com.tms.backend.dto.AuthDTO;
import com.tms.backend.dto.LoginDTO;
import com.tms.backend.dto.RegisterDTO;

public interface AuthUserService {
	AuthDTO login(LoginDTO data);
	AuthDTO register(RegisterDTO data);
}
