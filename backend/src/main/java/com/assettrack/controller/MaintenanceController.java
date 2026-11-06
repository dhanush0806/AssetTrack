package com.assettrack.controller;

import com.assettrack.entity.MaintenanceRecord;
import com.assettrack.repository.MaintenanceRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceController {

    private final MaintenanceRecordRepository maintenanceRepository;

    public MaintenanceController(MaintenanceRecordRepository maintenanceRepository) {
        this.maintenanceRepository = maintenanceRepository;
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceRecord>> getAllRecords() {
        return ResponseEntity.ok(maintenanceRepository.findAll());
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<MaintenanceRecord>> getByAssetId(@PathVariable String assetId) {
        return ResponseEntity.ok(maintenanceRepository.findByAssetId(assetId));
    }

    @PostMapping
    public ResponseEntity<MaintenanceRecord> createRecord(@RequestBody MaintenanceRecord record) {
        MaintenanceRecord saved = maintenanceRepository.save(record);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
