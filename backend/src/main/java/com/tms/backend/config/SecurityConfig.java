package com.tms.backend.config;
import org.springframework.security.config.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.tms.backend.filter.JwtFilter;
import com.tms.backend.repository.UserRepository;

@Configuration
@EnableMethodSecurity
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	UserDetailsService userDetailsService(UserRepository userRepository) {
		return username -> userRepository.findByEmail(username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found!"));
	}

	@Bean
	BCryptPasswordEncoder bCryptPasswordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter jwtFilter, RestErrorWriter restErrorWriter)
			throws Exception {
		return http
				.cors(Customizer.withDefaults())
				.csrf(customizer -> customizer.disable()).httpBasic(basic -> basic.disable())
				.formLogin(form -> form.disable()).logout(logout -> logout.disable())
				.requestCache(cache -> cache.disable())

				.authorizeHttpRequests(req -> req

						.requestMatchers("/api/tms/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

						.anyRequest().authenticated())

				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				.exceptionHandling(ex -> ex
						.authenticationEntryPoint((req, res, e) -> restErrorWriter.write(req, res, "UNAUTHORIZED",
								HttpStatus.UNAUTHORIZED.value(), "NEED TO LOGIN!"))
						.accessDeniedHandler((req, res, e) -> restErrorWriter.write(req, res, "FORBIDDEN",
								HttpStatus.FORBIDDEN.value(), "You don't have permission to access this resource")))

				.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class).build();
	}

}
