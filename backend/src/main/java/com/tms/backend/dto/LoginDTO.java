package com.tms.backend.dto;
import jakarta.validation.constraints.*;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginDTO {
	

    @NotBlank(message = "email is required")
    @Email(message = "email must be a valid email")
    @Size(max = 160, message = "email must be at most 160 characters")
    private String email;

    @NotBlank(message = "password is required")
    @Size(min = 8, max = 64, message = "password must be 8-64 characters")
    private String password;
   
}
