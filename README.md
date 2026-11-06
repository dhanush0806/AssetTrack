# AssetTrack — Professional Enterprise Asset Management System

AssetTrack is an enterprise-grade IT equipment and fixed asset lifecycle tracking platform. It enables organizations to register hardware with scannable asset tags, assign equipment to employees, enforce availability validations, maintain immutable custody histories, schedule maintenance, track warranty expirations, and export CSV audit reports.

---

## 1. System Architecture

```
                    ┌────────────────────────────────────────┐
                    │      AssetTrack Web Client (Vite)      │
                    │  React 19 + TypeScript + Tailwind CSS  │
                    └───────────────────┬────────────────────┘
                                        │ REST APIs & Client Storage
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    AssetTrack Enterprise Backend API                       │
│                       Java 21 + Spring Boot 3.3.2                          │
│                                                                            │
│  Controllers ──► Services ──► Repositories (Spring Data JPA) ──► Hibernate │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │ JDBC / Flyway
                                      ▼
                    ┌────────────────────────────────────────┐
                    │           MySQL 8.0 Database           │
                    │   8 Normalized Entities & Migrations   │
                    └────────────────────────────────────────┘
```

---

## 2. User Roles & RBAC Matrix

| Capability / Resource | Administrator | Asset Manager | Employee |
| :--- | :---: | :---: | :---: |
| **System Dashboard & Valuation Metrics** | Full Access | Full Access | View Only |
| **Register & Edit Asset Specifications** | Yes | Yes | View Only |
| **Assign Equipment to Employees** | Yes | Yes | — |
| **Record Asset Returns & Condition Notes** | Yes | Yes | Request Return |
| **Assignment History & Lifecycle Logs** | Full Audit Trail | Full Audit Trail | My History |
| **Schedule Maintenance & Record Costs** | Yes | Yes | Request Service |
| **Warranty Tracking & Expiry Alerts** | Yes | Yes | — |
| **Category Classification & Lifespans** | Full Access | View Only | View Only |
| **Employee Directory & Custody View** | Full Access | Full Access | View Only |
| **Export Reports (Inventory, Maint, CSV)**| Yes | Yes | — |
| **User & Role Administration** | Full Access | — | — |
| **System Preferences & Audit Trail** | Full Access | View Only | — |

---

## 3. Implemented Pages (17 Total)

1. **Login (`/login`)**: Secure authentication with corporate role selection (Administrator, Asset Manager, Employee).
2. **Dashboard (`/dashboard`)**: Executive metrics, asset counts by status, category valuations, warranty alerts, and recent assignments.
3. **Asset Inventory (`/assets`)**: Searchable, filterable, sortable, and paginated hardware table with barcode tags.
4. **Register Asset (`/assets/new`)**: Hardware tag generator, serial numbers, cost basis, warranty dates, and specifications.
5. **Asset Details (`/assets/:id`)**: Hardware specs, barcode badge, straight-line depreciation calculation, warranty status, assignment timeline, and maintenance log.
6. **Edit Asset (`/assets/:id/edit`)**: Update operational specs, locations, and status.
7. **Categories (`/categories`)**: Equipment taxonomies, icons, and depreciation lifespan settings.
8. **Employee Directory (`/employees`)**: Company personnel roster, department badges, and active custody counts.
9. **Employee Details (`/employees/:id`)**: Personnel contact details, active assigned equipment, and past custody history.
10. **Assign Asset (`/assign`)**: Enforces availability rules (preventing unavailable assets from being checked out), issue dates, and expected return schedules.
11. **Assignment History (`/assignments/history`)**: Full chronological custody trail, condition ratings, and return notes.
12. **Return Asset (`/returns`)**: Process hardware returns, condition assessments (Excellent to Damaged), and optional direct routing to maintenance.
13. **Maintenance Records (`/maintenance`)**: Repair work orders, vendor contacts, repair costs, and status transitions back to available inventory.
14. **Warranty Tracking (`/warranties`)**: Expired and impending warranty expirations (<30d critical, <60d warning) with in-app reminders.
15. **Reports (`/reports`)**: One-click CSV export generators for Master Inventory, Maintenance Expenditures, Employee Custody, and Warranty Risks.
16. **User & Role Management (`/users`)**: Administrator console for managing user roles, department affiliations, and authentication accounts.
17. **Profile & Settings (`/settings`)**: User preferences, organization tag prefixes, default warranty notices, and security audit log.
18. **Not-Found Page (`*`)**: Error handler with quick navigation back to inventory and dashboard.

---

## 4. MySQL Database Schema

- `users`: ID, email, password_hash, full_name, role (ADMIN, ASSET_MANAGER, EMPLOYEE), department, is_active, timestamps.
- `employees`: ID, employee_code, first_name, last_name, email, department, job_title, phone, status, joined_date, user_id.
- `asset_categories`: ID, code, name, description, icon, expected_lifespan_months.
- `assets`: ID, asset_tag, serial_number, name, category_id, brand, model, purchase_date, purchase_cost, warranty_expiry_date, status (AVAILABLE, ASSIGNED, UNDER_MAINTENANCE, RETIRED), location, notes, current_assignee_id.
- `asset_assignments`: ID, asset_id, employee_id, assigned_by_id, assigned_date, expected_return_date, returned_date, return_condition, return_notes, status (ACTIVE, RETURNED).
- `maintenance_records`: ID, asset_id, issue_description, reported_date, scheduled_date, completed_date, cost, service_provider, technician_name, status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED), resolution_notes.
- `notifications`: ID, user_id, title, message, type, severity, link, is_read, created_at.
- `activity_logs`: ID, user_id, user_name, user_role, action, entity_type, entity_id, details, ip_address, timestamp.

Database migrations are located in `src/main/resources/db/migration/`:
- `V1__initial_schema.sql`: Full schema DDL with foreign keys, constraints, and indexes.
- `V2__seed_enterprise_data.sql`: Realistic corporate equipment and personnel seed dataset.

---

## 5. Local Setup & Execution

### Frontend (Port 3000)
```bash
npm install
npm run dev
```

### Backend (Spring Boot & MySQL on Port 8080)
```bash
# Configure database in application.yml or environment variables:
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=assettrack_db
export DB_USER=assettrack_user
export DB_PASSWORD=EnterprisePass2026!

# Build and run:
./mvnw clean spring-boot:run
```

### Automated Unit Testing
```bash
npx --yes tsx --test src/utils/assetRules.test.ts
```
