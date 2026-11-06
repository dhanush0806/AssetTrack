# AssetTrack Standalone Backend (Spring Boot + MySQL)

This folder contains the complete, standalone Java 21 + Spring Boot 3.3.2 REST API for **AssetTrack**.

---

## 1. Environment Configuration

The application reads configuration from environment variables (or `.env` in the root folder):

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=assettrack_db
DB_USER=assettrack_user
DB_PASSWORD=EnterprisePass2026!
SERVER_PORT=8080
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
```

---

## 2. Quick Start Options

### Option A: Run with Docker Compose (Recommended - Starts MySQL & Spring Boot together)
```bash
docker compose up -d
```
- API will be accessible at: `http://localhost:8080/api`
- Swagger / OpenAPI UI: `http://localhost:8080/swagger-ui.html`

### Option B: Run with Maven
1. Ensure MySQL is running on port 3306 and database `assettrack_db` exists:
```sql
CREATE DATABASE assettrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'assettrack_user'@'%' IDENTIFIED BY 'EnterprisePass2026!';
GRANT ALL PRIVILEGES ON assettrack_db.* TO 'assettrack_user'@'%';
FLUSH PRIVILEGES;
```

2. Build and run Spring Boot:
```bash
mvn clean spring-boot:run
```

Flyway will automatically execute migrations:
- `V1__initial_schema.sql` (Creates all 8 tables with foreign keys and indexes)
- `V2__seed_enterprise_data.sql` (Inserts initial enterprise assets and user accounts)

---

## 3. REST API Endpoints

- `GET /api/assets` — Retrieve all assets
- `POST /api/assets` — Register equipment
- `GET /api/assets/{id}` — Asset details & warranty calculation
- `PUT /api/assets/{id}` — Update asset specifications
- `POST /api/assignments/assign` — Assign equipment to employee
- `POST /api/assignments/return` — Process return and update inventory status
- `GET /api/assignments/active` — Currently checked out hardware
- `GET /api/assets/warranties/expiring` — Expiring warranties within specified days
