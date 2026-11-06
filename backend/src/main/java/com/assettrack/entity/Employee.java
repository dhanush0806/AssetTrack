package com.assettrack.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "employee_code", nullable = false, unique = true, length = 32)
    private String employeeCode;

    @Column(name = "first_name", nullable = false, length = 60)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 60)
    private String lastName;

    @Column(nullable = false, unique = true, length = 191)
    private String email;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(name = "job_title", nullable = false, length = 100)
    private String jobTitle;

    @Column(length = 32)
    private String phone;

    @Column(nullable = false, length = 32)
    private String status = "ACTIVE";

    @Column(name = "joined_date", nullable = false)
    private LocalDate joinedDate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Employee() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getJoinedDate() { return joinedDate; }
    public void setJoinedDate(LocalDate joinedDate) { this.joinedDate = joinedDate; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
