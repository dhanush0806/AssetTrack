package com.assettrack.repository;

import com.assettrack.entity.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssetCategoryRepository extends JpaRepository<AssetCategory, String> {
    Optional<AssetCategory> findByCode(String code);
    boolean existsByCode(String code);
}
