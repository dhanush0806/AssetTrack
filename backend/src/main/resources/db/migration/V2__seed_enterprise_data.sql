-- V2: Initial Enterprise Seed Data for AssetTrack

INSERT INTO asset_categories (id, code, name, description, icon, expected_lifespan_months, created_at)
VALUES 
('cat-1', 'COMP', 'Computers & Laptops', 'Workstations, laptops, ultrabooks, and developer machines', 'Laptop', 36, NOW()),
('cat-2', 'DISP', 'Displays & Monitors', '4K monitors, ultrawide displays, color calibration panels', 'Monitor', 48, NOW()),
('cat-3', 'MOBI', 'Mobile Devices & Tablets', 'Corporate smartphones, testing tablets, handheld scanners', 'Smartphone', 24, NOW()),
('cat-4', 'NETW', 'Networking & Servers', 'Rack switches, firewalls, enterprise Wi-Fi 6 access points, edge servers', 'Server', 60, NOW()),
('cat-5', 'AVCF', 'AV & Conferencing', 'Meeting room video bars, wireless speakerphones, PTZ cameras, mics', 'Video', 36, NOW()),
('cat-6', 'FURN', 'Ergonomic Furniture', 'Motorized standing desks, Herman Miller Aeron chairs, monitor arms', 'Armchair', 84, NOW());

-- Users (BCrypt hashes for password: EnterprisePass2026!)
INSERT INTO users (id, email, password_hash, full_name, role, department, is_active, created_at)
VALUES
('usr-admin', 'admin@assettrack.com', '$2a$12$e8YqJmX8k2r.mBqg8H8qkeYJ6Gk9M3E9jW7gq2g1n5e9y6o0w9a8m', 'Eleanor Vance', 'ADMIN', 'Information Technology', TRUE, NOW()),
('usr-manager', 'manager@assettrack.com', '$2a$12$e8YqJmX8k2r.mBqg8H8qkeYJ6Gk9M3E9jW7gq2g1n5e9y6o0w9a8m', 'Marcus Sterling', 'ASSET_MANAGER', 'IT Asset Operations', TRUE, NOW()),
('usr-employee', 'employee@assettrack.com', '$2a$12$e8YqJmX8k2r.mBqg8H8qkeYJ6Gk9M3E9jW7gq2g1n5e9y6o0w9a8m', 'Sophia Martinez', 'EMPLOYEE', 'Software Engineering', TRUE, NOW());

INSERT INTO employees (id, employee_code, first_name, last_name, email, department, job_title, phone, status, joined_date, user_id, created_at)
VALUES
('emp-101', 'EMP-0101', 'Sophia', 'Martinez', 'sophia.martinez@company.internal', 'Software Engineering', 'Senior Frontend Engineer', '+1 (555) 234-5678', 'ACTIVE', '2024-02-15', 'usr-employee', NOW()),
('emp-102', 'EMP-0102', 'David', 'Kim', 'david.kim@company.internal', 'Software Engineering', 'Staff Backend Architect', '+1 (555) 345-6789', 'ACTIVE', '2023-11-01', NULL, NOW()),
('emp-103', 'EMP-0103', 'Elena', 'Rostova', 'elena.rostova@company.internal', 'Product Design', 'Lead UX Specialist', '+1 (555) 456-7890', 'ACTIVE', '2024-04-10', NULL, NOW());

INSERT INTO assets (id, asset_tag, serial_number, name, category_id, brand, model, purchase_date, purchase_cost, warranty_expiry_date, status, location, current_assignee_id, current_assignment_id, notes, created_at)
VALUES
('ast-101', 'AST-1001', 'C02FX93AMD6R', 'MacBook Pro 16" M3 Max', 'cat-1', 'Apple', 'MacBook Pro 16" (36GB / 1TB)', '2024-03-10', 3499.00, '2027-03-10', 'ASSIGNED', 'San Francisco HQ - Desk 4B', 'emp-101', 'asg-01', 'AppleCare+ Enterprise active', NOW()),
('ast-102', 'AST-1002', 'DELL-99281-XPS', 'Dell XPS 15 9530', 'cat-1', 'Dell', 'XPS 15 (Core i9 / 32GB)', '2024-01-20', 2450.00, '2026-11-20', 'ASSIGNED', 'San Francisco HQ - Desk 4C', 'emp-102', 'asg-02', 'Dell ProSupport Plus active', NOW()),
('ast-104', 'AST-1004', 'DELL-U2723QE-042', 'Dell UltraSharp 27" 4K Hub', 'cat-2', 'Dell', 'U2723QE IPS Black', '2024-04-05', 620.00, '2027-04-05', 'AVAILABLE', 'IT Storage Room A - Rack 2', NULL, NULL, 'Tested and ready', NOW()),
('ast-106', 'AST-1006', 'APL-IP15P-256BK', 'iPhone 15 Pro 256GB Black', 'cat-3', 'Apple', 'iPhone 15 Pro A3101', '2023-10-01', 1099.00, '2026-11-05', 'UNDER_MAINTENANCE', 'Vendor: Apple Authorized Service', NULL, NULL, 'Battery diagnostic', NOW());

INSERT INTO asset_assignments (id, asset_id, employee_id, assigned_by_id, assigned_date, expected_return_date, status, created_at)
VALUES
('asg-01', 'ast-101', 'emp-101', 'usr-manager', '2024-03-12 14:00:00', '2027-03-12', 'ACTIVE', NOW()),
('asg-02', 'ast-102', 'emp-102', 'usr-manager', '2024-01-22 11:00:00', '2026-11-20', 'ACTIVE', NOW());

INSERT INTO maintenance_records (id, asset_id, issue_description, reported_date, cost, service_provider, status, created_at)
VALUES
('mnt-01', 'ast-106', 'Battery degraded below 78% health threshold', NOW(), 149.00, 'Apple Authorized Service Provider', 'IN_PROGRESS', NOW());
