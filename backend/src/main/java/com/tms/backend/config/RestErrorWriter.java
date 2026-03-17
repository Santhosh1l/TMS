package com.tms.backend.config;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tms.backend.dto.ErrorDTO;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RestErrorWriter {
	private final ObjectMapper mapper = new ObjectMapper();
	
	public void write(HttpServletRequest req, HttpServletResponse res, String error, int status, String message) throws IOException {
		ErrorDTO body = ErrorDTO.builder()
				.error(error)
				.status(status)
				.message(message)
				.path(req.getRequestURI())
				.details(null)
				.timestamp(Timestamp.from(Instant.now()))
				.build();
		mapper.writeValue(res.getOutputStream(), body);
	}

}