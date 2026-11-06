package com.assettrack.service.impl;

import com.assettrack.entity.Asset;
import com.assettrack.entity.AssetAssignment;
import com.assettrack.entity.Employee;
import com.assettrack.entity.User;
import com.assettrack.exception.AssetUnavailableException;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.repository.AssetAssignmentRepository;
import com.assettrack.repository.AssetRepository;
import com.assettrack.repository.EmployeeRepository;
import com.assettrack.repository.UserRepository;
import com.assettrack.service.AssignmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AssignmentServiceImpl implements AssignmentService {

    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AssetAssignmentRepository assignmentRepository;

    public AssignmentServiceImpl(
            AssetRepository assetRepository,
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            AssetAssignmentRepository assignmentRepository) {
        this.assetRepository = assetRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Override
    public AssetAssignment assignAsset(String assetId, String employeeId, String assignedById, LocalDate expectedReturnDate) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));

        if (asset.getStatus() != Asset.Status.AVAILABLE) {
            throw new AssetUnavailableException("Asset " + asset.getAssetTag() + " is currently " + asset.getStatus() + " and cannot be assigned.");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        User assignedBy = userRepository.findById(assignedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + assignedById));

        AssetAssignment assignment = new AssetAssignment();
        assignment.setId(UUID.randomUUID().toString());
        assignment.setAsset(asset);
        assignment.setEmployee(employee);
        assignment.setAssignedBy(assignedBy);
        assignment.setAssignedDate(LocalDateTime.now());
        assignment.setExpectedReturnDate(expectedReturnDate);
        assignment.setStatus(AssetAssignment.Status.ACTIVE);

        asset.setStatus(Asset.Status.ASSIGNED);
        asset.setCurrentAssignee(employee);
        assetRepository.save(asset);

        return assignmentRepository.save(assignment);
    }

    @Override
    public AssetAssignment processReturn(String assetId, AssetAssignment.ReturnCondition condition, String returnNotes, boolean sendToMaintenance) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));

        AssetAssignment activeAssignment = assignmentRepository.findByAssetIdAndStatus(assetId, AssetAssignment.Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active assignment found for asset: " + asset.getAssetTag()));

        activeAssignment.setStatus(AssetAssignment.Status.RETURNED);
        activeAssignment.setReturnedDate(LocalDateTime.now());
        activeAssignment.setReturnCondition(condition);
        activeAssignment.setReturnNotes(returnNotes);

        if (condition == AssetAssignment.ReturnCondition.DAMAGED ||
            condition == AssetAssignment.ReturnCondition.NEEDS_REPAIR ||
            sendToMaintenance) {
            asset.setStatus(Asset.Status.UNDER_MAINTENANCE);
        } else {
            asset.setStatus(Asset.Status.AVAILABLE);
        }

        asset.setCurrentAssignee(null);
        assetRepository.save(asset);

        return assignmentRepository.save(activeAssignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetAssignment> getActiveAssignments() {
        return assignmentRepository.findByStatus(AssetAssignment.Status.ACTIVE);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetAssignment> getAssetHistory(String assetId) {
        return assignmentRepository.findByAssetId(assetId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetAssignment> getEmployeeHistory(String employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId);
    }
}
