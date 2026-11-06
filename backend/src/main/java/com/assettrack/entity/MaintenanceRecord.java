package com.assettrack.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_records")
public class MaintenanceRecord {

    public enum Status {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(name = "issue_description", nullable = false, columnDefinition = "TEXT")
    private String issueDescription;

    @Column(name = "reported_date", nullable = false)
    private LocalDateTime reportedDate = LocalDateTime.now();

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cost = BigDecimal.ZERO;

    @Column(name = "service_provider", nullable = false, length = 150)
    private String serviceProvider;

    @Column(name = "technician_name", length = 100)
    private String technicianName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Status status = Status.PENDING;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public MaintenanceRecord() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

    public String getIssueDescription() { return issueDescription; }
    public void setIssueDescription(String issueDescription) { this.issueDescription = issueDescription; }

    public LocalDateTime getReportedDate() { return reportedDate; }
    public void setReportedDate(LocalDateTime reportedDate) { this.reportedDate = reportedDate; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public LocalDateTime getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDateTime completedDate) { this.completedDate = completedDate; }

    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }

    public String getServiceProvider() { return serviceProvider; }
    public void setServiceProvider(String serviceProvider) { this.serviceProvider = serviceProvider; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
