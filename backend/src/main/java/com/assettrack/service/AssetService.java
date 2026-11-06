package com.assettrack.service;

import com.assettrack.entity.Asset;
import java.util.List;
import java.util.Optional;

public interface AssetService {
    List<Asset> findAllAssets();
    Optional<Asset> findById(String id);
    Optional<Asset> findByAssetTag(String assetTag);
    Asset registerAsset(Asset asset);
    Asset updateAsset(String id, Asset asset);
    List<Asset> getExpiredWarranties();
    List<Asset> getExpiringWarranties(int daysAhead);
}
