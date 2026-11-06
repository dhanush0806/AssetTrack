package com.assettrack.service.impl;

import com.assettrack.entity.Asset;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.repository.AssetRepository;
import com.assettrack.service.AssetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;

    public AssetServiceImpl(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Asset> findAllAssets() {
        return assetRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Asset> findById(String id) {
        return assetRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Asset> findByAssetTag(String assetTag) {
        return assetRepository.findByAssetTag(assetTag);
    }

    @Override
    public Asset registerAsset(Asset asset) {
        if (asset.getId() == null) {
            asset.setId(UUID.randomUUID().toString());
        }
        if (assetRepository.existsByAssetTag(asset.getAssetTag())) {
            throw new IllegalArgumentException("Asset tag already exists: " + asset.getAssetTag());
        }
        return assetRepository.save(asset);
    }

    @Override
    public Asset updateAsset(String id, Asset updated) {
        Asset existing = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));

        existing.setName(updated.getName());
        existing.setBrand(updated.getBrand());
        existing.setModel(updated.getModel());
        existing.setPurchaseCost(updated.getPurchaseCost());
        existing.setWarrantyExpiryDate(updated.getWarrantyExpiryDate());
        existing.setLocation(updated.getLocation());
        existing.setNotes(updated.getNotes());
        existing.setStatus(updated.getStatus());

        return assetRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Asset> getExpiredWarranties() {
        return assetRepository.findExpiredWarranties(LocalDate.now());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Asset> getExpiringWarranties(int daysAhead) {
        LocalDate now = LocalDate.now();
        LocalDate threshold = now.plusDays(daysAhead);
        return assetRepository.findExpiringWarranties(now, threshold);
    }
}
