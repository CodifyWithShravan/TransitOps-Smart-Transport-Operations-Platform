# TransitOps — Smart Transport Operations Platform

> **Hackathon Duration:** 8 Hours  
> **Stack:** Spring Boot 3.x · Java 21 · MySQL · Lombok · Jakarta Validation

---

## 1. Business Context

Many logistics companies still rely on spreadsheets and manual logbooks to manage their transport operations. This leads to scheduling conflicts, underutilized vehicles, missed maintenance, expired driver licenses, inaccurate expense tracking, and poor operational visibility.

**TransitOps** is a centralized platform that allows organizations to manage the complete lifecycle of their transport operations — from vehicle registration and driver management to dispatching, maintenance, fuel logging, and analytics.

---

## 2. Target Users

| Role               | Responsibility                                                                 |
|---------------------|-------------------------------------------------------------------------------|
| **Fleet Manager**   | Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency |
| **Dispatcher**      | Creates trips, assigns vehicles and drivers, monitors active deliveries        |
| **Safety Officer**  | Ensures driver compliance, tracks license validity, monitors safety scores     |
| **Financial Analyst** | Reviews operational expenses, fuel consumption, maintenance costs, profitability |

---

## 3. Functional Requirements

### 3.1 Authentication
- Secure login using email and password.
- Role-Based Access Control (RBAC).
- Only authenticated users should access the application.

### 3.2 Dashboard
- **KPIs:** Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization (%).
- Filters by vehicle type, status, and region.

### 3.3 Vehicle Registry
- Fields: Registration Number (unique), Vehicle Name/Model, Type, Maximum Load Capacity, Odometer, Acquisition Cost, Status.
- **Status values:** `AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED`.

### 3.4 Driver Management
- Fields: Name, License Number, License Category, License Expiry Date, Contact Number, Safety Score, Status.
- **Status values:** `AVAILABLE`, `ON_TRIP`, `OFF_DUTY`, `SUSPENDED`.

### 3.5 Trip Management
- Create trips by selecting: source, destination, available vehicle, available driver, cargo weight, planned distance.
- **Trip lifecycle:** `DRAFT` → `DISPATCHED` → `COMPLETED` / `CANCELLED`.

### 3.6 Maintenance
- Create maintenance records for vehicles.
- Adding a vehicle to a Maintenance Log → status automatically becomes `IN_SHOP`.
- Closing maintenance → status reverts to `AVAILABLE` (unless `RETIRED`).

### 3.7 Fuel & Expense Management
- Record fuel logs (litres, cost, date) and other expenses (tolls, maintenance costs).
- Auto-compute total operational cost (Fuel + Maintenance) per vehicle.

### 3.8 Reports & Analytics
- **Metrics:** Fuel Efficiency (Distance / Fuel), Fleet Utilization, Operational Cost, Vehicle ROI.
- **Vehicle ROI** = `(Revenue - (Maintenance + Fuel)) / Acquisition Cost`
- CSV export required; PDF export optional.

---

## 4. Mandatory Business Rules

| # | Rule |
|---|------|
| 1 | Vehicle registration number must be **unique**. |
| 2 | `RETIRED` or `IN_SHOP` vehicles must **never** appear in the dispatch selection. |
| 3 | Drivers with **expired licenses** or `SUSPENDED` status **cannot** be assigned to trips. |
| 4 | A driver or vehicle already marked `ON_TRIP` **cannot** be assigned to another trip. |
| 5 | Cargo Weight must **not exceed** the vehicle's maximum load capacity. |
| 6 | **Dispatching** a trip → Vehicle and Driver status become `ON_TRIP`. |
| 7 | **Completing** a trip → Vehicle and Driver status revert to `AVAILABLE`. |
| 8 | **Cancelling** a dispatched trip → Vehicle and Driver restore to `AVAILABLE`. |
| 9 | Creating an active maintenance record → Vehicle status becomes `IN_SHOP`. |
| 10 | Closing maintenance → Vehicle reverts to `AVAILABLE` (unless `RETIRED`). |

---

## 5. Example Workflow

```
Step 1: Register vehicle 'Van-05' with max capacity 500 kg. Status = AVAILABLE.
Step 2: Register driver 'Alex' with a valid driving license.
Step 3: Create a trip with Cargo Weight = 450 kg.
Step 4: System validates 450 kg ≤ 500 kg → allows dispatch.
Step 5: Vehicle and Driver status → ON_TRIP.
Step 6: Complete the trip (enter final odometer + fuel consumed).
Step 7: Vehicle and Driver status → AVAILABLE.
Step 8: Create maintenance record (e.g., Oil Change). Vehicle → IN_SHOP (hidden from dispatch).
Step 9: Reports update operational cost and fuel efficiency.
```

---

## 6. Database Entities

| Entity            | Description                                  |
|-------------------|----------------------------------------------|
| **Users**         | Authentication & RBAC                        |
| **Roles**         | Role definitions (Fleet Manager, etc.)       |
| **Vehicles**      | Fleet vehicle registry                       |
| **Drivers**       | Driver profiles & compliance                 |
| **Trips**         | Transport dispatches with lifecycle          |
| **MaintenanceLogs** | Vehicle maintenance records                |
| **FuelLogs**      | Fuel consumption records per trip/vehicle     |
| **Expenses**      | Operational expenses (tolls, misc costs)     |

---

## 7. Mandatory Deliverables

- [x] Responsive web interface (frontend)
- [ ] Authentication with RBAC
- [x] CRUD for Vehicles and Drivers
- [x] Trip Management with validations
- [x] Automatic status transitions
- [x] Maintenance workflow
- [x] Fuel & Expense tracking
- [ ] Dashboard with KPIs

---

## 8. Bonus Features

- [ ] Charts and visual analytics
- [ ] PDF export
- [ ] Email reminders for expiring licenses
- [ ] Vehicle document management
- [ ] Search, filters, and sorting
- [ ] Dark mode

---

## 9. Backend Architecture (Layered)

```
com.example.Transit_Backend
├── model/
│   ├── enums/          # VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, ExpenseCategory
│   ├── Vehicle.java
│   ├── Driver.java
│   ├── Trip.java
│   ├── MaintenanceLog.java
│   ├── FuelLog.java
│   └── Expense.java
├── repository/         # Spring Data JPA interfaces + JPQL aggregates
├── dto/
│   ├── request/        # Request DTOs with jakarta.validation
│   └── response/       # Response DTOs with flattened relationships
├── exception/          # Custom exceptions + Global handler
├── service/            # Business logic + state transitions
├── controller/         # REST API endpoints
└── security/           # SecurityConfig (permitAll for now)
```

---

## 10. Build Progress Tracker

### Step 1 — Enums, Entities, Repositories ✅
- `VehicleStatus`, `DriverStatus`, `TripStatus` enums
- `Vehicle`, `Driver`, `Trip` JPA entities with Lombok
- `VehicleRepository`, `DriverRepository`, `TripRepository`
- `SecurityConfig` — permitAll (no auth for prototyping)

### Step 2 — DTOs, Exceptions, Services ✅
- Request/Response DTOs with `jakarta.validation`
- Custom `ValidationException`, `ResourceNotFoundException`, `IllegalStateTransitionException`
- Global `@RestControllerAdvice` exception handler
- `VehicleService`, `DriverService`, `TripService` with business rules

### Step 3 — REST Controllers ✅
- CRUD endpoints for Vehicle, Driver, Trip
- Status transition endpoints (dispatch, complete, cancel)

### Step 4 — Maintenance, Fuel, Expenses ✅
- `MaintenanceLog`, `FuelLog`, `Expense` entities + full stack (Entity → Repo → DTO → Service → Controller)
- `MaintenanceStatus`, `ExpenseCategory` enums
- JPQL aggregate queries for cost summation (used in analytics)
- Auto status transitions: create maintenance → IN_SHOP, close → AVAILABLE

### Step 5 — Dashboard & Analytics
- KPI aggregation endpoints
- Fleet utilization, fuel efficiency, vehicle ROI

### Step 6 — Auth & RBAC
- User/Role entities, JWT authentication
- Role-based endpoint protection

---

## How to Run

```bash
# Prerequisites: Java 21, MySQL 8+, Maven 3.9+

# 1. Create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS transitops;"

# 2. Update credentials in src/main/resources/application.properties

# 3. Build and run
./mvnw spring-boot:run
```

The application starts at `http://localhost:8080`.
