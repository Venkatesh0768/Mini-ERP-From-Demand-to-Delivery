# Mini-ERP — From Demand to Delivery

A full-stack, production-ready Enterprise Resource Planning system built with **Spring Boot 4** and **Next.js 16**. It covers the complete business cycle — from customer demand through procurement, manufacturing, and inventory to final delivery — with role-based access control, OAuth2 social login, and a real-time audit trail.

Video Link 
https://drive.google.com/file/d/1JYzDSeo-LXRDNv5P-pyL9C-lss_QPR2O/view   Watch at 2X
---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Roles & Permissions](#roles--permissions)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Running with Docker](#running-with-docker)
- [API Documentation](#api-documentation)
- [Default Admin Account](#default-admin-account)

---

<img width="1581" height="813" alt="Screenshot 2026-06-14 031421" src="https://github.com/user-attachments/assets/f7d88b37-3aaf-44db-893a-bbadbc9c5054" />
<img width="1904" height="911" alt="Screenshot 2026-06-14 031508" src="https://github.com/user-attachments/assets/460e056a-0fc8-46d9-b279-1830b6c7b260" />
<img width="1907" height="902" alt="Screenshot 2026-06-14 031523" src="https://github.com/user-attachments/assets/2c6a1bba-8763-4eb3-9b8c-428a6c4b07d2" />
<img width="1535" height="810" alt="Screenshot 2026-06-14 031547" src="https://github.com/user-attachments/assets/690a64db-1591-47b4-a52a-6eb898d2a367" />
<img width="1590" height="813" alt="Screenshot 2026-06-14 031606" src="https://github.com/user-attachments/assets/8f1e602b-383e-4cfc-b4ee-aab24e737eab" />


## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | Spring Boot 4.1.0 |
| Language | Java 21 |
| Security | Spring Security 6, JWT (JJWT 0.13), OAuth2 (Google, GitHub) |
| Database | MySQL 8.0 + Hibernate JPA + Flyway migrations |
| Cache / Sessions | Redis (Lettuce) — OTP storage, token blacklisting |
| Email | Spring Mail — Gmail SMTP / STARTTLS |
| File Uploads | Cloudinary |
| API Docs | SpringDoc OpenAPI 3 / Swagger UI |
| Build | Maven (multi-stage Docker with Distroless runtime) |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Lucide React icons |
| HTTP | Axios with silent token refresh interceptor |
| Auth | In-memory access token + HttpOnly refresh token cookie |
| Package Manager | pnpm 10 |
| Build output | Standalone (Docker-ready) |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                     Browser                          │
│  Next.js 16 (App Router)  ─── Edge Middleware ───→  │
│  React 19 + Tailwind 4        route guard            │
└────────────────────┬─────────────────────────────────┘
                     │ HTTPS / REST JSON
                     │ Authorization: Bearer <access-token>
                     │ Cookie: refreshToken (HttpOnly)
┌────────────────────▼─────────────────────────────────┐
│           Spring Boot 4  —  /api/v1                  │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────┐   │
│  │  Auth /  │ │  ERP     │ │  Audit / Dashboard  │   │
│  │  OAuth2  │ │  Modules │ │  Admin              │   │
│  └──────────┘ └──────────┘ └────────────────────┘   │
│        │            │                                 │
│  ┌─────▼────┐  ┌────▼─────┐                          │
│  │  MySQL 8 │  │  Redis   │                          │
│  └──────────┘  └──────────┘                          │
└──────────────────────────────────────────────────────┘
```

Token strategy:
- **Access token** — short-lived JWT (default 1 day), stored **in-memory only** (not localStorage).
- **Refresh token** — long-lived (default 7 days), stored as an **HttpOnly cookie**, rotated on every use.
- On 401, Axios automatically attempts a silent refresh and retries queued requests.

---

## Features

### Authentication & User Management
- Email/password signup with **OTP email verification**
- **OAuth2 social login** — Google and GitHub
- Forgot password / reset password via OTP
- Admin-created accounts with **email activation link**
- JWT access tokens + rotating HttpOnly refresh token cookies
- Role assignment, enable/disable/ban users
- Profile management with Cloudinary image upload
- Full session management with nightly token cleanup

### ERP Modules

| Module | Key Capabilities |
|--------|----------------|
| **Products** | FINISHED_GOOD / RAW_MATERIAL / CONSUMABLE types, procurement type (PURCHASE / MANUFACTURING), stock tracking |
| **Customers** | Customer registry with auto-generated codes, contact info |
| **Vendors** | Vendor registry with auto-generated codes |
| **Sales Orders** | Lifecycle: DRAFT → CONFIRMED → PARTIALLY_DELIVERED → DELIVERED / CANCELLED |
| **Purchase Orders** | Lifecycle: DRAFT → CONFIRMED → RECEIVED / CANCELLED, updates stock on receipt |
| **Bill of Materials (BOM)** | Define multi-component recipes for finished goods |
| **Manufacturing Orders** | Lifecycle: DRAFT → CONFIRMED → IN_PROGRESS → COMPLETED / CANCELLED, consumes BOM components from stock |
| **Inventory** | Real-time transaction ledger (PURCHASE_RECEIPT, SALES_DELIVERY, MANUFACTURING_CONSUMPTION, MANUFACTURING_PRODUCTION, MANUAL_ADJUSTMENT) |
| **Stock Adjustments** | Manual inventory corrections |
| **Dashboard** | Aggregated KPIs — orders, users, low-stock alerts, inventory value |
| **Audit Logs** | Immutable log of every CREATE / UPDATE / DELETE / LOGIN / LOGOUT / APPROVE / CANCEL / RECEIVE / COMPLETE action |

---

## Roles & Permissions

| Role | Access |
|------|--------|
| `ROLE_ADMIN` | Full system access including user management |
| `ROLE_BUSINESS_OWNER` | Dashboard, audit logs, all ERP modules (read + write) |
| `ROLE_SALES_USER` | Customers, Sales Orders |
| `ROLE_PURCHASE_USER` | Vendors, Purchase Orders |
| `ROLE_MANUFACTURING_USER` | BOM, Manufacturing Orders |
| `ROLE_INVENTORY_MANAGER` | Products, Inventory, Stock Adjustments |
| `ROLE_USER` | Profile only |

---

## Project Structure

```
Mini-ERP-From-Demand-to-Delivery/
├── .env                          # Docker Compose variables (root)
├── backend/
│   ├── .env                      # Backend runtime variables
│   ├── docker-compose.yml        # MySQL + backend services
│   ├── Dockerfile                # Multi-stage: temurin:25-jdk → distroless/java25
│   ├── pom.xml
│   └── src/main/java/org/odoo/backend/
│       ├── audit/                # Audit log module
│       ├── auth/                 # Security, JWT, OAuth2, user management
│       │   └── config/seeders/   # Dev data seeders
│       ├── bom/                  # Bill of Materials
│       ├── common/               # Shared DTOs, exceptions, base models
│       ├── customer/
│       ├── dashboard/
│       ├── inventory/
│       ├── manufacturing/
│       ├── product/
│       ├── purchase/
│       ├── sales/
│       └── vendor/
└── erp-frontend/
    ├── .env.local                # Frontend environment variables
    ├── Dockerfile                # Multi-stage: node:24-alpine → distroless/nodejs22
    ├── middleware.ts             # Next.js Edge route protection
    ├── app/
    │   ├── (auth)/               # login, register, verify-otp, activate, reset-password, oauth2
    │   └── (protected)/          # dashboard, admin, audit-logs, bom, customers,
    │                             # inventory, manufacturing, products, profile,
    │                             # purchases, sales, vendors
    ├── components/
    │   ├── admin/                # User management UI
    │   ├── layout/               # Navbar, Sidebar
    │   └── ui/                   # Shared component library
    ├── context/AuthContext.tsx   # Global auth state (React Context + useReducer)
    ├── hooks/useRouteGuard.ts    # Client-side role guard
    ├── lib/api/                  # Axios client + API modules
    └── types/                    # TypeScript types for auth and ERP domain
```

---

## Environment Variables

### Backend — `backend/.env`

Copy this file and fill in all required values before running.

```env
# ─── Database (MySQL) ────────────────────────────────────────────────────────
DB_URL=jdbc:mysql://mysql:3306/<your_database>?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=<db_user>
DB_PASSWORD=<db_password>

# MySQL container settings (used by docker-compose)
MYSQL_ROOT_PASSWORD=<root_password>
MYSQL_DATABASE=<database_name>
MYSQL_USER=<db_user>
MYSQL_PASSWORD=<db_password>

# ─── Server ───────────────────────────────────────────────────────────────────
SERVER_PORT=5000

# ─── JWT ─────────────────────────────────────────────────────────────────────
# Generate a strong secret: openssl rand -base64 64
JWT_SECRET=<your_jwt_secret_min_64_chars>
JWT_EXPIRATION=86400000          # 1 day in ms (optional, has default)
JWT_REFRESH_EXPIRATION=604800000 # 7 days in ms (optional, has default)

# ─── OTP ─────────────────────────────────────────────────────────────────────
OTP_EXPIRATION=300000  # 5 minutes in ms (optional, has default)
OTP_LENGTH=6           # (optional, has default)

# ─── CORS & App URLs ─────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS=http://localhost:3000
APP_FRONTEND_URL=http://localhost:3000
APP_BASE_URL=http://localhost:5000

# ─── Email (Gmail SMTP) ──────────────────────────────────────────────────────
MAIL_USERNAME=your_gmail@gmail.com
# Use a Gmail App Password (not your account password)
# Generate at: https://myaccount.google.com/apppasswords
MAIL_PASSWORD=<gmail_app_password>

# ─── OAuth2 Social Login ─────────────────────────────────────────────────────
# Google: https://console.cloud.google.com → Credentials → OAuth 2.0 Client
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>

# GitHub: https://github.com/settings/developers → OAuth Apps
GITHUB_CLIENT_ID=<github_client_id>
GITHUB_CLIENT_SECRET=<github_client_secret>

# ─── Redis ────────────────────────────────────────────────────────────────────
REDIS_HOST=localhost       # Use 'redis' if running inside Docker network
REDIS_PORT=6379
REDIS_PASSWORD=            # Leave empty if no auth

# ─── Default Admin Seed ───────────────────────────────────────────────────────
# Created automatically on first boot if no ROLE_ADMIN user exists
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<strong_password>
ADMIN_FIRST_NAME=Super
ADMIN_LAST_NAME=Admin

# ─── Cloudinary (Profile Image Uploads) ──────────────────────────────────────
# https://cloudinary.com → Dashboard → API Keys
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

# ─── SonarQube (optional, CI/CD only) ────────────────────────────────────────
SONAR_TOKEN=<sonar_token>
```

### Frontend — `erp-frontend/.env.local`

```env
# Backend API base URL (must match your backend server + context path)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Application display name
NEXT_PUBLIC_APP_NAME=Mini ERP

# Cloudinary — for direct browser uploads (profile images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud_name>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<upload_preset>
```

> **Note:** `NEXT_PUBLIC_*` variables are baked into the frontend bundle at **build time**. If you change them you must rebuild.

---

## Running Locally

### Prerequisites

| Tool | Version |
|------|---------|
| Java | 21+ |
| Maven | 3.9+ (or use `./mvnw`) |
| Node.js | 22+ |
| pnpm | 10+ (`npm install -g pnpm`) |
| MySQL | 8.0+ |
| Redis | 7+ |

---

### 1. Start MySQL and Redis

You can use Docker just for the infrastructure:

```bash
docker run -d --name erp-mysql -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=erp_db \
  -e MYSQL_USER=erp_user \
  -e MYSQL_PASSWORD=erp_pass \
  mysql:8.0

docker run -d --name erp-redis -p 6379:6379 redis:7-alpine
```

Or install them natively and start their services.

---

### 2. Run the Backend

```bash
cd backend

# Copy and fill in the environment file
copy .env.example .env   # Windows
# cp .env.example .env   # Mac/Linux

# Run with Maven wrapper
./mvnw spring-boot:run
# On Windows:
mvnw.cmd spring-boot:run
```

The API will be available at `http://localhost:5000/api/v1`.

**Tip:** On first boot, the seeder automatically creates a default admin user using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` values from your `.env`.

---

### 3. Run the Frontend

```bash
cd erp-frontend

# Install dependencies
pnpm install

# Copy and fill in the environment file
copy .env.local.example .env.local   # Windows
# cp .env.local.example .env.local   # Mac/Linux

# Start development server
pnpm dev
```

The frontend will be available at `http://localhost:3000`.

---

## Running with Docker

This is the recommended approach for a consistent environment.

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- The backend image must be built before running compose.

---

### Step 1 — Build the backend image

```bash
cd backend
docker build -t erp_backend:latest .
```

This performs a two-stage build:
1. Compiles and packages the JAR using `eclipse-temurin:25-jdk`
2. Runs on a minimal `gcr.io/distroless/java25-debian13` image

---

### Step 2 — Configure the environment

Fill in `backend/.env` (see [Environment Variables](#environment-variables) above).
The `docker-compose.yml` reads this file for both the MySQL container and the backend container.

---

### Step 3 — Start backend + database

```bash
cd backend
docker compose up -d
```

This starts:
- **mysql** — MySQL 8.0 on port `3306`, persistent volume `erp_db`
- **erp_backend** — Spring Boot API on port `5000`

The backend waits for MySQL's healthcheck to pass before starting.

Check logs:

```bash
docker compose logs -f erp_backend
docker compose logs -f mysql
```

---

### Step 4 — Build and run the frontend

```bash
cd erp-frontend

docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1 \
  --build-arg NEXT_PUBLIC_APP_NAME="Mini ERP" \
  -t erp_frontend:latest .

docker run -d \
  --name erp_frontend \
  -p 3000:3000 \
  erp_frontend:latest
```

The frontend image is also a three-stage build:
1. Production deps install with `pnpm`
2. Next.js production build (`standalone` output)
3. Minimal runtime on `gcr.io/distroless/nodejs22-debian12`

---

### All services running

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api/v1 |
| Swagger UI | http://localhost:5000/api/v1/swagger-ui.html |
| MySQL | localhost:3306 |

---

### Stopping everything

```bash
cd backend
docker compose down          # stop and remove containers
docker compose down -v       # also remove the MySQL data volume
```

---

## API Documentation

Swagger UI is available at:

```
http://localhost:5000/api/v1/swagger-ui.html
```

OpenAPI JSON spec:

```
http://localhost:5000/api/v1/v3/api-docs
```

All protected endpoints require a `Bearer` token in the `Authorization` header. Use the `/auth/login` endpoint first to obtain a token, then click **Authorize** in the Swagger UI.

---

## Default Admin Account

On first boot, if no `ROLE_ADMIN` user exists in the database, the system automatically seeds one using the values from your `.env`:

```
Email:    ADMIN_EMAIL
Password: ADMIN_PASSWORD
```

Change the password immediately after your first login in production.

---

## Health Check

```
GET http://localhost:5000/api/v1/actuator/health
```

Returns `{ "status": "UP" }` — no authentication required.



