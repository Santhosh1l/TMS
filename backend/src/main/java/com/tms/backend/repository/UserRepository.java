package com.tms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;
import com.tms.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	List<User> findAllByRole(UserRole role);
	Optional<User> findByEmail(String email);
	boolean existsByEmail(String email);
	List<User> findAllByIsDeleteFalse();
	User findByName(String name);
	Optional<User> findByEmailAndIsDeleteFalse(String email);

	// Paginated queries
	Page<User> findAllByIsDeleteFalse(Pageable pageable);
	Page<User> findAllByIsDeleteFalseAndRole(UserRole role, Pageable pageable);
	Page<User> findAllByIsDeleteFalseAndStatus(UserStatus status, Pageable pageable);
	Page<User> findAllByIsDeleteFalseAndRoleAndStatus(UserRole role, UserStatus status, Pageable pageable);

	// Paginated for manager-scoped queries
	Page<User> findAllByIsDeleteFalseAndManager_Id(Long managerId, Pageable pageable);
	Page<User> findAllByIsDeleteFalseAndManager_IdAndRole(Long managerId, UserRole role, Pageable pageable);
	Page<User> findAllByIsDeleteFalseAndManager_IdAndStatus(Long managerId, UserStatus status, Pageable pageable);
	Page<User> findAllByIsDeleteFalseAndManager_IdAndRoleAndStatus(Long managerId, UserRole role, UserStatus status, Pageable pageable);
}
