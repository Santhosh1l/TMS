package com.tms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tms.backend.enums.UserRole;
import com.tms.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	List<User> findAllByRole(UserRole role);
	Optional<User> findByEmail(String email);
	boolean existsByEmail(String email);
	List<User> findAllByIsDeleteFalse();
	User findByName(String name);
}
