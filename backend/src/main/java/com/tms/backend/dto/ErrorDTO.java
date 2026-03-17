
package com.tms.backend.dto;

import lombok.*;
import jakarta.validation.constraints.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.ErrorManager;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ErrorDTO {

    private Timestamp timestamp;
    
    private String path;

    private int status;

    private String error;

    private String message;

    @Builder.Default
    private Map<String, String> details = new HashMap<>();


}
