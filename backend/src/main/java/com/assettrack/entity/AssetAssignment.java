package com.assettrack.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_assignments")
public class AssetAssignment {

    public enum Status {
        ACTIVE,
        RETURNED
    }

    public enum ReturnCondition {
        EXCELLENT,
        GOOD,
        FAIR,
        DAMAGED,
        NEEDS_REPAIR
    }

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id", nullable = false)
    private User assignedBy;

    @Column(name = "assigned_date", nullable = false)
    private LocalDateTime assignedDate = LocalDateTime.now();

    @Column(name = "expected_return_date")
    private LocalDate expectedReturnDate;

    @Column(name = "returned_date")
    private LocalDateTime returnedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "return_condition", length = 32)
    private ReturnCondition returnCondition;

    @Column(name = "return_notes", columnDefinition = "TEXT")
    private String returnNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Status status = Status.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AssetAssignment() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public User getAssignedBy() { return assignedBy; }
    public void setAssignedBy(User assignedBy) { this.assignedBy = assignedBy; }

    public LocalDateTime getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDateTime assignedDate) { this.assignedDate = assignedDate; }

    public LocalDate getExpectedReturnDate() { return expectedReturnDate; }
    public void setExpectedReturnDate(LocalDate expectedReturnDate) { this.expectedReturnDate = expectedReturnDate; }

    public LocalDateTime getReturnedDate() { return returnedDate; }
    public void setReturnedDate(LocalDateTime returnedDate) { this.returnedDate = returnedDate; }

    public ReturnCondition getReturnCondition() { return returnCondition; }
    public void setReturnCondition(ReturnCondition returnCondition) { this.returnCondition = returnCondition; }

    public String getReturnNotes() { return returnNotes; }
    public void setReturnNotes(String returnNotes) { this.returnNotes = returnNotes; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
