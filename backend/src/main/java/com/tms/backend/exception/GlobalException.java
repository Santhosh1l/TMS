package com.tms.backend.exception;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.tms.backend.dto.ErrorDTO;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalException {

	public static ErrorDTO buildErrorDto(HttpStatus status, String message, Map<String, String> details,
			HttpServletRequest request) {

		return ErrorDTO.builder().timestamp(Timestamp.from(Instant.now()))
				.status(status.value())
				.error(status.getReasonPhrase())
				.message(message)
				.details(details)
				.path(request.getRequestURI())
				.build();
		
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorDTO> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {

		Map<String, String> details = new HashMap<>();
		for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
			details.put(fe.getField(), fe.getDefaultMessage());
		}

		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(buildErrorDto(HttpStatus.BAD_REQUEST, ex.getMessage(), details, request));
	}

	@ExceptionHandler(UsernameNotFoundException.class)
	public ResponseEntity<ErrorDTO> handleUsernameNotFound(UsernameNotFoundException ex, HttpServletRequest req) {

		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(buildErrorDto(HttpStatus.UNAUTHORIZED, ex.getMessage(), null, req));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorDTO> handleIllegalArgumentException(IllegalArgumentException ex,
			HttpServletRequest req) {

		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(buildErrorDto(HttpStatus.BAD_REQUEST, ex.getMessage(), null, req));
	}

	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<ErrorDTO> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(buildErrorDto(HttpStatus.UNAUTHORIZED, ex.getMessage(), null, req));
	}

	@ExceptionHandler(IllegalAccessException.class)
	public ResponseEntity<ErrorDTO> handleIllegalAcessException(IllegalAccessException ex, HttpServletRequest req) {

		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(buildErrorDto(HttpStatus.UNAUTHORIZED, ex.getMessage(), null, req));
	}

	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<ErrorDTO> handleBadRequest(BadRequestException ex, HttpServletRequest req) {

		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(buildErrorDto(HttpStatus.BAD_REQUEST, ex.getMessage(), null, req));
	}

	//
//		@ExceptionHandler(Exception.class)
//		public ResponseEntity<ErrorDTO> handleException(Exception ex, HttpServletRequest req) {
//			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
//					buildErrorDto(HttpStatus.UNAUTHORIZED, ex.getMessage(), Map.of("path", req.getRequestURI()), req));
//		}

}