package com.assettrack.repository;

import com.assettrack.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {
    Optional<Employee> findByEmployeeCode(String employeeCode);
    Optional<Employee> findByEmail(String email);
    boolean existsByEmployeeCode(String employeeCode);
}
