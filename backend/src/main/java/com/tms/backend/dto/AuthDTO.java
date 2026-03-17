
package com.tms.backend.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.Date;


@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthDTO {
	
	//id
	private Long userId;
	
    @NotBlank(message = "token is required")
    private String token;

    @NotNull(message = "expiration is required")
    private Date expiration;

    
}
