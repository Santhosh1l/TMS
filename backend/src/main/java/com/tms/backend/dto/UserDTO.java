package com.tms.backend.dto;
import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;
import jakarta.validation.constraints.*;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
	
    private Long userId;
	
    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name must be at most 100 characters")
    private String name;
    
    @NotBlank(message = "email is required")
    @Email(message = "email must be a valid email")
    @Size(max = 160, message = "email must be at most 160 characters")
    private String email;
    
    @NotNull(message = "role is required")
    private UserRole role;
    
    @Positive(message = "managerId must be a positive number")
    private Long managerId;
    
    @NotNull(message = "status is required")
    private UserStatus status;
    
    @Size(max = 80, message = "department must be at most 80 characters")
    private String department;
    
    @Size(max = 80, message = "location must be at most 80 characters")
    private String location;
    
}
