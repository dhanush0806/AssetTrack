package com.assettrack.repository;

import com.assettrack.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, String> {
    List<MaintenanceRecord> findByAssetId(String assetId);
    List<MaintenanceRecord> findByStatus(MaintenanceRecord.Status status);
}
