package com.assettrack.controller;

import com.assettrack.entity.Asset;
import com.assettrack.service.AssetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "*")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(assetService.findAllAssets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable String id) {
        return assetService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Asset> registerAsset(@RequestBody Asset asset) {
        Asset created = assetService.registerAsset(asset);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable String id, @RequestBody Asset asset) {
        return ResponseEntity.ok(assetService.updateAsset(id, asset));
    }

    @GetMapping("/warranties/expired")
    public ResponseEntity<List<Asset>> getExpiredWarranties() {
        return ResponseEntity.ok(assetService.getExpiredWarranties());
    }

    @GetMapping("/warranties/expiring")
    public ResponseEntity<List<Asset>> getExpiringWarranties(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(assetService.getExpiringWarranties(days));
    }
}
