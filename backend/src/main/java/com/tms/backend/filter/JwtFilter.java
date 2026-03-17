package com.tms.backend.filter;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import com.tms.backend.config.RestErrorWriter;
import com.tms.backend.model.User;
import com.tms.backend.repository.UserRepository;
import com.tms.backend.util.JwtUtils;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

	private final JwtUtils jwtUtils;
	private final UserDetailsService userDetailsService;
	private final RestErrorWriter restErrorWriter;
	private final UserRepository userRepository;

	public JwtFilter(JwtUtils jwtUtils, UserDetailsService userDetailsService, RestErrorWriter restErrorWriter,
			UserRepository userRepository) {
		super();
		this.jwtUtils = jwtUtils;
		this.userDetailsService = userDetailsService;
		this.restErrorWriter = restErrorWriter;
		this.userRepository = userRepository;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String uri = request.getRequestURI();
		return uri.startsWith("/api/tms/auth/") || uri.startsWith("/v3/api-docs/") || uri.startsWith("/swagger-ui/")
				|| uri.equals("/swagger-ui.html");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String authHeader = request.getHeader("Authorization");
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);
			try {
				if (jwtUtils.isTokenValid(token)) {
					String username = jwtUtils.extractUsername(token);

					if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
						UserDetails user = userDetailsService.loadUserByUsername(username);
						UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
								user.getUsername(), user.getPassword(), user.getAuthorities());
						authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
						SecurityContextHolder.getContext().setAuthentication(authToken);
					}
				}

			} catch (ExpiredJwtException e) {
				restErrorWriter.write(request, response, "TOKEN EXPIRED", HttpStatus.BAD_REQUEST.value(),
						"JWT Token got expired");
				return;
			} catch (JwtException e) {
				restErrorWriter.write(request, response, "TOKEN INVALID", HttpStatus.BAD_REQUEST.value(),
						"JWT Token got INVALID");
				return;
			}
		}

		filterChain.doFilter(request, response);

	}

}
