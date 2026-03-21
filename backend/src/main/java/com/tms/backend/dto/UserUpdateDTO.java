
package com.tms.backend.dto;

import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
	private String name;
	private String email;
	private Long userId;

	private UserRole role;

	private UserStatus status;

	private String department;

	private String location;

	private Long managerId;

}