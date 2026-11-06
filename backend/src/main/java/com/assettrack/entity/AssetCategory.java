package com.assettrack.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_categories")
public class AssetCategory {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 16)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 32)
    private String icon = "Box";

    @Column(name = "expected_lifespan_months", nullable = false)
    private Integer expectedLifespanMonths = 36;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AssetCategory() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Integer getExpectedLifespanMonths() { return expectedLifespanMonths; }
    public void setExpectedLifespanMonths(Integer expectedLifespanMonths) { this.expectedLifespanMonths = expectedLifespanMonths; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
