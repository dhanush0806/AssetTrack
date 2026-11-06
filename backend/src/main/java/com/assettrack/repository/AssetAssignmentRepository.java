package com.assettrack.repository;

import com.assettrack.entity.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, String> {

    List<AssetAssignment> findByAssetId(String assetId);

    List<AssetAssignment> findByEmployeeId(String employeeId);

    Optional<AssetAssignment> findByAssetIdAndStatus(String assetId, AssetAssignment.Status status);

    List<AssetAssignment> findByStatus(AssetAssignment.Status status);

    long countByStatus(AssetAssignment.Status status);
}
