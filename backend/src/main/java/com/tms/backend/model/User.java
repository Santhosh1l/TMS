
package com.tms.backend.model;

import com.tms.backend.enums.UserRole;
import com.tms.backend.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.Collection;
import java.util.Collections;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@SuppressWarnings("serial")
@Entity
@Table(name = "users", indexes = { @Index(name = "idx_users_role", columnList = "role"),
		@Index(name = "idx_users_status", columnList = "status") })

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User implements UserDetails {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Long id;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(nullable = false, length = 160, unique = true)
	private String email;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private UserRole role;

	@Column(name = "password_hash", nullable = false, length = 200)
	private String password;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "manager_id", foreignKey = @ForeignKey(name = "fk_users_manager"))
	private User manager;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	@Builder.Default
	private UserStatus status = UserStatus.ACTIVE;

	@Column(length = 80)
	private String department;

	@Column(length = 80)
	private String location;

	@Column(name = "is_delete", nullable = false)
	@Builder.Default
	private boolean isDelete = false;

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return Collections.singleton(new SimpleGrantedAuthority(role.name()));
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return email;
	}

//    @OneToMany(mappedBy = "user", orphanRemoval = false)
//    @Builder.Default
//    private List<Enrollment> enrollments = new ArrayList<>();
//
//    @OneToMany(mappedBy = "user", orphanRemoval = false)
//    @Builder.Default
//    private List<Attendance> attendances = new ArrayList<>();
//
//    @OneToMany(mappedBy = "createdBy", orphanRemoval = false)
//    @Builder.Default
//    private List<Task> tasksCreated = new ArrayList<>();
//
//    @OneToMany(mappedBy = "user", orphanRemoval = false)
//    @Builder.Default
//    private List<TaskAttempt> taskAttempts = new ArrayList<>();

}
