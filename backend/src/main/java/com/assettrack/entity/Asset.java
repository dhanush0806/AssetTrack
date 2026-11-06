package com.assettrack.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
public class Asset {

    public enum Status {
        AVAILABLE,
        ASSIGNED,
        UNDER_MAINTENANCE,
        RETIRED
    }

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "asset_tag", nullable = false, unique = true, length = 64)
    private String assetTag;

    @Column(name = "serial_number", nullable = false, length = 128)
    private String serialNumber;

    @Column(nullable = false, length = 160)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private AssetCategory category;

    @Column(nullable = false, length = 80)
    private String brand;

    @Column(nullable = false, length = 120)
    private String model;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "purchase_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal purchaseCost;

    @Column(name = "warranty_expiry_date", nullable = false)
    private LocalDate warrantyExpiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Status status = Status.AVAILABLE;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_assignee_id")
    private Employee currentAssignee;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructors, Getters & Setters
    public Asset() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public AssetCategory getCategory() { return category; }
    public void setCategory(AssetCategory category) { this.category = category; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public BigDecimal getPurchaseCost() { return purchaseCost; }
    public void setPurchaseCost(BigDecimal purchaseCost) { this.purchaseCost = purchaseCost; }

    public LocalDate getWarrantyExpiryDate() { return warrantyExpiryDate; }
    public void setWarrantyExpiryDate(LocalDate warrantyExpiryDate) { this.warrantyExpiryDate = warrantyExpiryDate; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Employee getCurrentAssignee() { return currentAssignee; }
    public void setCurrentAssignee(Employee currentAssignee) { this.currentAssignee = currentAssignee; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
