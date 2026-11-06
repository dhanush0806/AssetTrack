-- V1: Initial Enterprise Schema for AssetTrack MySQL Database

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'EMPLOYEE',
    department VARCHAR(100),
    avatar_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY,
    employee_code VARCHAR(32) NOT NULL UNIQUE,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    phone VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    joined_date DATE NOT NULL,
    user_id VARCHAR(36),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_emp_dept (department),
    INDEX idx_emp_code (employee_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS asset_categories (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(32) DEFAULT 'Box',
    expected_lifespan_months INT NOT NULL DEFAULT 36,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cat_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(36) PRIMARY KEY,
    asset_tag VARCHAR(64) NOT NULL UNIQUE,
    serial_number VARCHAR(128) NOT NULL,
    name VARCHAR(160) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(120) NOT NULL,
    purchase_date DATE NOT NULL,
    purchase_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    warranty_expiry_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
    location VARCHAR(150) NOT NULL,
    notes TEXT,
    current_assignee_id VARCHAR(36),
    current_assignment_id VARCHAR(36),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_asset_category FOREIGN KEY (category_id) REFERENCES asset_categories(id),
    CONSTRAINT fk_asset_assignee FOREIGN KEY (current_assignee_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_asset_status (status),
    INDEX idx_asset_tag (asset_tag),
    INDEX idx_asset_warranty (warranty_expiry_date),
    INDEX idx_asset_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS asset_assignments (
    id VARCHAR(36) PRIMARY KEY,
    asset_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    assigned_by_id VARCHAR(36) NOT NULL,
    assigned_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATE,
    returned_date DATETIME,
    return_condition VARCHAR(32),
    return_notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asg_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_asg_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_asg_assigned_by FOREIGN KEY (assigned_by_id) REFERENCES users(id),
    INDEX idx_asg_status (status),
    INDEX idx_asg_asset (asset_id),
    INDEX idx_asg_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_records (
    id VARCHAR(36) PRIMARY KEY,
    asset_id VARCHAR(36) NOT NULL,
    issue_description TEXT NOT NULL,
    reported_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scheduled_date DATE,
    completed_date DATETIME,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    service_provider VARCHAR(150) NOT NULL,
    technician_name VARCHAR(100),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    resolution_notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_maint_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX idx_maint_status (status),
    INDEX idx_maint_asset (asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'INFO',
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_read (is_read),
    INDEX idx_notif_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(120) NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(32) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_timestamp (timestamp),
    INDEX idx_activity_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
