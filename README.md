# Mini-ERP: From Demand to Delivery

A comprehensive, modular Enterprise Resource Planning (ERP) platform designed to manage the complete product lifecycle. This system handles everything from initial procurement and manufacturing (BOM) to final sales, featuring a modern dashboard and robust role-based access.

## 🚀 Features

- **Sales Module:** Full sales order workflows, tracking statuses, status-dependent field locking, and automated availability logic.
- **Purchase & Procurement:** Deep visibility into procurement operations, including `procureOnDemand` tracking.
- **Manufacturing & BOM (Bill of Materials):** Comprehensive management of components, assemblies, and manufacturing orders.
- **High-Fidelity Dashboarding:** Real-time operational dashboard with dynamic insights and pagination across all modules.
- **Secure Authentication:** OAuth2 and JWT-based authentication with Spring Security.

## 💻 Tech Stack

**Frontend:**
- [Next.js 16](https://nextjs.org/) (React 19)
- [Tailwind CSS v4](https://tailwindcss.com/)
- TypeScript

**Backend:**
- [Spring Boot 3](https://spring.io/projects/spring-boot) (Java 21)
- Spring Security & OAuth2
- Hibernate / JPA

**Infrastructure & Databases:**
- MySQL 8.0 (Primary Database)
- Redis 7 (Caching & Sessions)
- Docker & Docker Compose

## 📁 Project Structure

```text
Mini-ERP-From-Demand-to-Delivery/
├── backend/            # Spring Boot Java API
├── erp-frontend/       # Next.js React application
├── docker-compose.yml  # Docker orchestration file
└── .env                # Global environment variables
```

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Java 21](https://adoptium.net/) (for local backend development)
- [Node.js 20+](https://nodejs.org/) (for local frontend development)
- [MySQL 8.0](https://www.mysql.com/) & [Redis](https://redis.io/) (if running locally without Docker)
- [Docker](https://www.docker.com/) & Docker Compose (for containerized deployment)

---

## 🐳 How to Run (Docker)

The easiest way to get the entire stack up and running is using Docker Compose. This will spin up the MySQL database, Redis cache, Spring Boot backend, and Next.js frontend in isolated containers.

1. **Configure Environment Variables:**
   Ensure your `.env` file is present in the root directory and populated with the necessary secrets (DB credentials, JWT secrets, OAuth keys, etc.).

2. **Build and Start the Containers:**
   Run the following command from the root directory:
   ```bash
   docker-compose up --build -d
   ```

3. **Access the Application:**
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)

4. **Stop the Containers:**
   ```bash
   docker-compose down
   ```

---

## 💻 How to Run (Locally for Development)

If you wish to run the project locally for development, follow these steps:

### 1. Database & Cache
Ensure you have a local instance of MySQL and Redis running. Create a database in MySQL that matches the `MYSQL_DATABASE` variable in your `.env` file.

### 2. Backend Setup
Navigate to the `backend` directory, install dependencies, and start the Spring Boot server:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```
The backend will be available at `http://localhost:5000`.

### 3. Frontend Setup
Navigate to the `erp-frontend` directory, install dependencies, and start the development server:

```bash
cd erp-frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.

## 🔐 Environment Variables (.env)

A root `.env` file is required to provide configuration to the application. Key variables include:

- `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `JWT_SECRET`, `JWT_EXPIRATION`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`

*(See the existing `.env` file for the complete list of required keys).*