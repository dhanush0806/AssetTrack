package com.assettrack.repository;

import com.assettrack.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, String> {

    Optional<Asset> findByAssetTag(String assetTag);

    boolean existsByAssetTag(String assetTag);

    List<Asset> findByStatus(Asset.Status status);

    List<Asset> findByCategoryId(String categoryId);

    List<Asset> findByCurrentAssigneeId(String employeeId);

    @Query("SELECT a FROM Asset a WHERE a.warrantyExpiryDate < :currentDate")
    List<Asset> findExpiredWarranties(LocalDate currentDate);

    @Query("SELECT a FROM Asset a WHERE a.warrantyExpiryDate >= :currentDate AND a.warrantyExpiryDate <= :thresholdDate")
    List<Asset> findExpiringWarranties(LocalDate currentDate, LocalDate thresholdDate);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.status = :status")
    long countByStatus(Asset.Status status);
}
