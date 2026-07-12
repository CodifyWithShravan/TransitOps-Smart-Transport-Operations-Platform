# TransitOps — Smart Transport Operations Platform

<div align="center">

![TransitOps Banner](https://img.shields.io/badge/TransitOps-Smart%20Transport%20Operations-00E5FF?style=for-the-badge&logo=fleet)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React 18](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Java 21](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT Security](https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)

An enterprise-grade, end-to-end fleet management, intelligent trip dispatching, maintenance automation, and financial analytics platform.

</div>

---

## 📖 Table of Contents
1. [Executive Summary & Business Context](#1-executive-summary--business-context)
2. [Key Features & Core Modules](#2-key-features--core-modules)
3. [Mandatory Business Rules Enforcement](#3-mandatory-business-rules-enforcement)
4. [System Architecture & Tech Stack](#4-system-architecture--tech-stack)
5. [Complete Project Directory Structure](#5-complete-project-directory-structure)
6. [Setup & Installation Instructions](#6-setup--installation-instructions)
7. [REST API Documentation Overview](#7-rest-api-documentation-overview)
8. [Example Operational Workflow](#8-example-operational-workflow)
9. [Team Pitch & Presentation Guide](#9-team-pitch--presentation-guide)

---

## 1. Executive Summary & Business Context

In the modern logistics and transportation industry, managing fleet assets with fragmented spreadsheets, paper logbooks, and disconnected group chats leads to severe operational leakages:
- **Scheduling Conflicts:** Double-booking vehicles already dispatched on trips or broken down in the repair shop.
- **Uncontrolled Maintenance Costs:** Unexpected vehicle breakdowns due to missed routine servicing.
- **Driver Safety Risk:** Assigning drivers with expired licenses or suspended status to high-value cargo.
- **Financial Blindness:** Lack of real-time visibility into cost-per-kilometer, fuel consumption efficiency, and true vehicle ROI.

**TransitOps** solves this by uniting **Fleet Registry, Driver Compliance, Intelligent Trip Dispatching, Automated Maintenance Workflows, and Visual Financial Analytics** into one synchronized, transactional platform. Every action taken—whether dispatching a trip or opening a repair ticket—automatically updates vehicle and driver statuses across the entire system in real time.

---

## 2. Key Features & Core Modules

### ⚡ 1. Command Center Dashboard
- **Live KPI Snapshot:** Instant metrics for Total Vehicles, Available Vehicles, Active Dispatched Trips, Vehicles in Maintenance, and Operational Utilization Percentage.
- **Financial Ticker:** Real-time summary of Total Fuel Cost, Maintenance Repairs, and Overall Operational Costs.

### 🚛 2. Smart Fleet Registry
- Complete vehicle lifecycle tracking with unique registration numbers, make/model, load capacities, odometers, and acquisition costs.
- **Atomic Statuses:** `AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED`.

### 🧑‍✈️ 3. Driver Management & Safety Compliance
- Driver roster tracking license validity, categories, contact info, and automated **Safety Scores**.
- **Atomic Statuses:** `AVAILABLE`, `ON_TRIP`, `OFF_DUTY`, `SUSPENDED`.

### 🧭 4. Intelligent Trip Dispatcher
- **Conflict-Free Selection:** Dropdowns strictly filter for `AVAILABLE` vehicles and `AVAILABLE` drivers.
- **Load Capacity Safeguard:** Automatically prevents dispatch if planned cargo weight exceeds vehicle capacity.
- **Atomic Lifecycle:** Transitions trips through `DRAFT` → `DISPATCHED` → `COMPLETED` / `CANCELLED`, automatically locking and releasing vehicle/driver statuses.

### 🔧 5. Automated Maintenance Shop
- Logging a service record automatically switches the vehicle to `IN_SHOP` status, removing it from dispatch availability.
- Clicking **Release to Available** closes the service ticket and restores the vehicle to `AVAILABLE`.

### ⛽ 6. Fuel & Operational Expense Tracking
- Track fuel logs (litres consumed, total cost) and general operational expenses (tolls, fines, repairs).
- Dynamically feeds into per-vehicle operational cost models.

### 📊 7. Visual Analytics & Live ROI Engine
- **100% Dynamic Calculations:** All charts, daily dispatch trends, utilization rates, and cost-per-km metrics are computed live from PostgreSQL database records.
- **Interactive SVG Charts:** Day-by-day dispatch volume visualization and fleet availability status progress bars.
- **Vehicle-Level ROI Table:** Detailed table showing individual vehicle revenue, fuel costs, maintenance costs, and operational efficiency.

### 📥 8. Audit-Ready CSV Exports
- One-click CSV export endpoints for **Vehicles**, **Drivers**, **Trips**, and **Vehicle Analytics**.

---

## 3. Mandatory Business Rules Enforcement

| # | Business Rule | System Enforcement Implementation |
|---|---------------|-----------------------------------|
| **1** | Unique Registration Number | Enforced at the database constraint (`UNIQUE`) & DTO validation layer. |
| **2** | Hidden Unavailable Vehicles | `IN_SHOP` or `RETIRED` vehicles are excluded from Trip Dispatch dropdowns. |
| **3** | Driver Compliance Validation | `SUSPENDED` drivers or drivers with expired licenses cannot be assigned to trips. |
| **4** | Double-Booking Prevention | Vehicles or drivers marked `ON_TRIP` cannot be assigned to another concurrent trip. |
| **5** | Cargo Load Limit | Trip creation throws an explicit exception if `cargoWeight > vehicle.maxLoadCapacity`. |
| **6** | Dispatch Lock | Transitioning a trip to `DISPATCHED` locks both vehicle and driver status to `ON_TRIP`. |
| **7** | Completion Release | Marking a trip `COMPLETED` updates the odometer and restores vehicle/driver to `AVAILABLE`. |
| **8** | Cancellation Rollback | Cancelling a dispatched trip rolls back vehicle and driver statuses to `AVAILABLE`. |
| **9** | Maintenance Lockout | Opening a maintenance ticket immediately sets vehicle status to `IN_SHOP`. |
| **10** | Maintenance Release | Closing/releasing a maintenance ticket restores vehicle status to `AVAILABLE`. |

---

## 4. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                         FRONTEND LAYER (React 18 + Vite)                          |
|  [Dashboard]  [Fleet]  [Drivers]  [Trips]  [Maintenance]  [Fuel]  [Analytics]     |
+-----------------------------------------------------------------------------------+
                                        |  REST API / JSON (Axios + JWT Interceptors)
                                        v
+-----------------------------------------------------------------------------------+
|                     SECURITY LAYER (Spring Security 6 + JWT)                      |
|           Stateless JWT Authentication Filter | Role-Based Access Control         |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                   BACKEND BUSINESS LAYER (Spring Boot 3 + Java 21)                |
|       [Controllers] ---> [Services (Transactional Rules)] ---> [JPA Repositories] |
+-----------------------------------------------------------------------------------+
                                        |  Hibernate / JDBC
                                        v
+-----------------------------------------------------------------------------------+
|                        DATABASE LAYER (PostgreSQL / MySQL)                        |
|   [Users] [Vehicles] [Drivers] [Trips] [MaintenanceLogs] [FuelLogs] [Expenses]    |
+-----------------------------------------------------------------------------------+
```

### Stack Highlights:
- **Frontend:** React 18, Vite, React Router v6, Axios, Bootstrap 5 + Custom High-Contrast Dark Theme (`#0F1115`).
- **Backend:** Java 21, Spring Boot 3.x, Spring MVC, Spring Data JPA, Jakarta Validation, Lombok.
- **Security:** Spring Security 6, Stateless JWT (JSON Web Tokens), BCrypt Password Hashing.
- **Database:** PostgreSQL / MySQL Relational Schema.

---

## 5. Complete Project Directory Structure

```
TransitOps/
├── README.md                          # Main Project Documentation
├── backend/
│   └── Transit_Backend/
│       ├── pom.xml                    # Maven Configuration & Dependencies
│       └── src/main/java/com/example/Transit_Backend/
│           ├── controller/            # REST API Controllers (Auth, Dashboard, Vehicles, etc.)
│           ├── dto/
│           │   ├── request/           # Request Payload DTOs with Validation
│           │   └── response/          # Structured Response DTOs
│           ├── exception/             # Global Exception Handler & Domain Exceptions
│           ├── model/                 # JPA Entities (Vehicle, Driver, Trip, MaintenanceLog, etc.)
│           │   └── enums/             # Atomic Status & Category Enums
│           ├── repository/            # Spring Data JPA Repositories
│           ├── security/              # JWT Filter, JwtService & SecurityConfig
│           └── service/               # Transactional Business Logic Implementation
└── frontend/
    ├── package.json                   # Frontend Scripts & NPM Dependencies
    ├── vite.config.js                 # Vite Bundler Configuration
    ├── index.html                     # Main Application Shell
    └── src/
        ├── components/                # Reusable UI Components (TopHeader, Modals)
        ├── pages/                     # Application Pages (Dashboard, Fleet, Trips, Maintenance, Analytics, etc.)
        ├── services/                  # API Client & Axios Interceptor Configuration
        └── styles/                    # High-Contrast Module CSS stylesheets
```

---

## 6. Setup & Installation Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **Java JDK:** v21 or higher
- **Database:** PostgreSQL (or MySQL 8.x)

### 1️⃣ Database Setup
Create a PostgreSQL or MySQL database named `transitops`:
```sql
CREATE DATABASE transitops;
```
Configure your database connection in `backend/Transit_Backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/transitops
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### 2️⃣ Start the Backend Server
Open a terminal in the backend directory and run:
```bash
cd backend/Transit_Backend
./mvnw spring-boot:run
```
The REST API will launch at `http://localhost:8080`.

### 3️⃣ Start the Frontend Application
Open a second terminal in the frontend directory and run:
```bash
cd frontend
npm install
npm run dev
```
The web application will be accessible at `http://localhost:5173`.

---

## 7. REST API Documentation Overview

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & return JWT Token |
| **Auth** | `POST` | `/api/auth/register` | Register new user account |
| **Dashboard**| `GET` | `/api/dashboard` | Fetch consolidated fleet & operational KPIs |
| **Dashboard**| `GET` | `/api/dashboard/analytics/vehicles` | Get per-vehicle ROI & cost breakdown |
| **Vehicles** | `GET` | `/api/vehicles` | List fleet vehicles (optional `?status=` filter) |
| **Vehicles** | `POST` | `/api/vehicles` | Register a new vehicle |
| **Drivers** | `GET` | `/api/drivers` | List drivers (optional `?status=` filter) |
| **Trips** | `GET` | `/api/trips` | List all dispatched & completed trips |
| **Trips** | `POST` | `/api/trips` | Create & dispatch a new trip (validates rules) |
| **Trips** | `PATCH`| `/api/trips/{id}/complete` | Complete a trip & release vehicle/driver |
| **Maintenance**| `GET` | `/api/maintenance` | List maintenance service logs |
| **Maintenance**| `POST`| `/api/maintenance` | Create maintenance ticket & lock vehicle `IN_SHOP` |
| **Maintenance**| `PATCH`| `/api/maintenance/{id}/close` | Complete service & release vehicle to `AVAILABLE` |
| **Exports** | `GET` | `/api/dashboard/export/*` | Download CSV exports for Vehicles, Trips, or Analytics |

---

## 8. Example Operational Workflow

1. **Register Fleet & Driver:** Add `TG-07-J-5970` (Max load: 5000 kg, Status: `AVAILABLE`) and Driver `Shravan` (Status: `AVAILABLE`).
2. **Dispatch Trip:** Create a trip assigning `TG-07-J-5970` and `Shravan`. Both statuses instantly transition to `ON_TRIP`.
3. **Double-Booking Prevention:** Attempting to assign `TG-07-J-5970` to a second trip automatically blocks selection.
4. **Complete Trip:** Mark the trip as completed. Vehicle and Driver statuses return to `AVAILABLE`.
5. **Log Maintenance:** Create a brake inspection ticket for `TG-07-J-5970`. Vehicle status changes to `IN_SHOP`.
6. **Release from Shop:** Click **Release to Available** on the Maintenance page. Ticket closes and vehicle becomes `AVAILABLE`.

---

## 9. Team Pitch & Presentation Guide

If presenting this project as a **3-Member Team (5 Minutes total)**, use the following distribution:

- **Speaker 1: Problem Statement & Industry Challenge (~1.5 mins)**
  - Discuss spreadsheet fragmentation, dispatch double-booking errors, and vehicle downtime surprises.
  - Introduce **TransitOps** as the unified transport control center.
- **Speaker 2: Live Platform Demo & Execution (~2 mins)**
  - Walk through **Dashboard KPIs**, **Smart Fleet Registry**, **Conflict-Free Trip Dispatcher**, **Automated Maintenance Lockouts**, and **Live Analytics**.
- **Speaker 3: Architecture, Tech Stack & Business ROI (~1.5 mins)**
  - Present the **React 18 + Spring Boot 3 + PostgreSQL** stack, transactional safety, and how TransitOps cuts operational overhead and maximizes fleet ROI.

---

<div align="center">
Built with ❤️ for Enterprise Transport & Logistics Operations
</div>
