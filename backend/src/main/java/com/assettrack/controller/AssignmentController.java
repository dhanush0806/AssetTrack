package com.assettrack.controller;

import com.assettrack.entity.AssetAssignment;
import com.assettrack.service.AssignmentService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    public static class AssignPayload {
        public String assetId;
        public String employeeId;
        public String assignedById;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        public LocalDate expectedReturnDate;
    }

    public static class ReturnPayload {
        public String assetId;
        public AssetAssignment.ReturnCondition returnCondition;
        public String returnNotes;
        public boolean sendToMaintenance;
    }

    @PostMapping("/assign")
    public ResponseEntity<AssetAssignment> assignAsset(@RequestBody AssignPayload payload) {
        AssetAssignment asg = assignmentService.assignAsset(
                payload.assetId,
                payload.employeeId,
                payload.assignedById,
                payload.expectedReturnDate
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(asg);
    }

    @PostMapping("/return")
    public ResponseEntity<AssetAssignment> returnAsset(@RequestBody ReturnPayload payload) {
        AssetAssignment asg = assignmentService.processReturn(
                payload.assetId,
                payload.returnCondition,
                payload.returnNotes,
                payload.sendToMaintenance
        );
        return ResponseEntity.ok(asg);
    }

    @GetMapping("/active")
    public ResponseEntity<List<AssetAssignment>> getActiveAssignments() {
        return ResponseEntity.ok(assignmentService.getActiveAssignments());
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<AssetAssignment>> getAssetHistory(@PathVariable String assetId) {
        return ResponseEntity.ok(assignmentService.getAssetHistory(assetId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AssetAssignment>> getEmployeeHistory(@PathVariable String employeeId) {
        return ResponseEntity.ok(assignmentService.getEmployeeHistory(employeeId));
    }
}
