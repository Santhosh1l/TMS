package com.tms.backend.util;

import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;



@Service
public class JwtUtils {
	
	@Value("${app.jwt.secret}")
	private String secret;
	
	@Value("${app.jwt.issuer}")
	private String issuer;
	
	@Value("${app.jwt.expiration}")
	private long expiration;
	
	private SecretKey key;
	
	@PostConstruct
	public void init() {
		this.key = Keys.hmacShaKeyFor(secret.getBytes());
	}
	
	public String generateKey(String username, Map<String, Object> claims) {
		return Jwts.builder()
				.addClaims(claims)
				.setSubject(username)
				.setIssuer(issuer)
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + expiration))
				.signWith(key, SignatureAlgorithm.HS256)
				.compact();
	}
	
	public String extractUsername(String token) {
		return parseToken(token).getBody().getSubject();
	}
	
	public boolean isTokenValid(String token) throws JwtException{
		parseToken(token);
		return true;
	}
	
	public Jws<Claims> parseToken(String token){
		return Jwts.parserBuilder()
				.setSigningKey(key)
				.build()
				.parseClaimsJws(token);
	}

}
