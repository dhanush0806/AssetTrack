package com.assettrack.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    public enum Role {
        ADMIN,
        ASSET_MANAGER,
        EMPLOYEE
    }

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 191)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Role role = Role.EMPLOYEE;

    @Column(length = 100)
    private String department;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
