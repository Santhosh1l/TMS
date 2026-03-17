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
public class RegisterDTO{

    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name must be at most 100 characters")
    private String name;
    
    @NotBlank(message = "email is required")
    @Email(message = "email must be a valid email")
    @Size(max = 160, message = "email must be at most 160 characters")
    private String email;
    
    private UserRole role;
    
    private Long managerId;
    
    @NotNull(message = "status is required")
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;
    
    @Size(max = 80, message = "department must be at most 80 characters")
    private String department;
    
    @NotBlank(message = "password is required")
    @Size(min = 8, max = 64, message = "password must be 8-64 characters")
    private String password;
    
}
