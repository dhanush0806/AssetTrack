package com.assettrack.service;

import com.assettrack.entity.AssetAssignment;
import java.time.LocalDate;
import java.util.List;

public interface AssignmentService {
    AssetAssignment assignAsset(String assetId, String employeeId, String assignedById, LocalDate expectedReturnDate);
    AssetAssignment processReturn(String assetId, AssetAssignment.ReturnCondition condition, String returnNotes, boolean sendToMaintenance);
    List<AssetAssignment> getActiveAssignments();
    List<AssetAssignment> getAssetHistory(String assetId);
    List<AssetAssignment> getEmployeeHistory(String employeeId);
}
