# TaskManagementSystem

A full-stack multi-user task management application with authentication, ownership enforcement, automated tests, and production-ready deployment with Traefik and Docker.

---

## Project Overview

Users can register, log in, and manage their own tasks. Each user can only access their own data. The backend enforces ownership at the database query level.

---

## Tech Stack

### Backend

- **Express** — HTTP server
- **TypeScript** — Type-safe codebase
- **PostgreSQL** — Relational database
- **Drizzle ORM** — Type-safe ORM with migrations
- **Zod** — Input validation
- **bcrypt** — Password hashing
- **JWT** — Authentication tokens
- **ESLint** — Code linting
- **Prettier** — Code formatting
- **Vitest + Supertest** — Unit and integration tests
- **Docker + Docker Compose** — Containerized development and production environment

### Frontend

- **React** — UI framework
- **Vite** — Build tool
- **TypeScript** — Type-safe codebase
- **Tailwind CSS** — Utility-first styling
- **Nginx** — Production static file server
- **ESLint** — Code linting
- **Prettier** — Code formatting

### Infrastructure

- **Traefik** — Reverse proxy with automatic HTTPS via Let's Encrypt
- **Docker multi-stage builds** — Optimized production images
- **Docker Compose** — Separate dev and prod configurations

---

## Folder Structure

```plaintext
TaskManagementSystem/
├── README.md
├── PROJECT DESIGN.md
├── TASK BREAKDOWN.md
├── docker-compose.yml           # Development
├── docker-compose.prod.yml      # Production
├── traefik/
│   └── traefik.yml              # Traefik configuration
├── client/
│   ├── Dockerfile.prod          # Production build with Nginx
│   ├── nginx.conf               # Nginx SPA configuration
│   └── src/
└── server/
    ├── Dockerfile               # Multi-stage build
    ├── drizzle.config.ts
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    └── src/
        ├── app.ts
        ├── server.ts
        ├── config/
        │   └── swagger.ts
        ├── middleware/
        │   ├── errorHandler.ts
        │   ├── rateLimiter.ts
        │   └── sanitize.ts
        ├── utils/
        │   ├── logger.ts
        │   └── validateEnv.ts
        ├── db/
        │   ├── schema.ts
        │   └── index.ts
        └── modules/
            ├── auth/
            │   ├── auth.controller.ts
            │   ├── auth.service.ts
            │   ├── auth.routes.ts
            │   ├── auth.schema.ts
            │   ├── auth.dto.ts
            │   ├── auth.middleware.ts
            │   ├── auth.service.test.ts
            │   └── auth.routes.test.ts
            └── tasks/
                ├── tasks.controller.ts
                ├── tasks.service.ts
                ├── tasks.repository.ts
                ├── tasks.routes.ts
                ├── tasks.schema.ts
                ├── tasks.dto.ts
                ├── tasks.service.test.ts
                └── tasks.routes.test.ts
```

---

## Architecture

### Backend Layers

The backend follows a strict layered architecture:

- **Controllers** → Handle HTTP only (parse request, send response)
- **Services** → Contain all business logic
- **Repositories** → Handle all database access
- **DTOs** → Define the shape of all request payloads and API responses
- **Schemas** → Zod validation for all incoming data

No database calls are made in controllers. No business logic lives in repositories.

### Production Infrastructure

```
Internet
   │
   ▼
Traefik :443 (HTTPS + Let's Encrypt)
   ├── api.yourdomain.com  ──► Express (port 3000)
   └── yourdomain.com      ──► Nginx  (port 80)
                                  │
                            internal network
                                  │
                             PostgreSQL
                          (not exposed to internet)
```

---

## Security

- **JWT** — Stateless authentication on all protected routes
- **CORS** — Restricted to the frontend domain only
- **Rate limiting** — Applied on auth and API routes
- **Input sanitization** — All incoming data is sanitized
- **Isolated DB network** — PostgreSQL only accessible from the server container
- **Environment secrets** — Never committed to Git

---

## Setup Instructions

### Option A — Docker Development (Recommended)

#### Prerequisites

- Docker Desktop

```bash
git clone https://github.com/ZahraaBah/TaskManagementSystem.git
cd TaskManagementSystem
docker compose up --build
```

- Server: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- API docs: `http://localhost:3000/api-docs`

---

### Option B — Local Setup

#### Prerequisites

- Node.js v20+
- PostgreSQL v16+

#### 1. Clone the repository

```bash
git clone https://github.com/ZahraaBah/TaskManagementSystem.git
cd TaskManagementSystem
```

#### 2. Install backend dependencies

```bash
cd server
npm install
```

#### 3. Configure environment variables

```bash
cp .env.example .env.development
```

Edit `.env.development`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskmanager
JWT_SECRET=your_jwt_secret_here
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. Create the database and run migrations

```bash
psql -U postgres -c "CREATE DATABASE taskmanager;"
npm run db:migrate
```

---

## Production Deployment

### Prerequisites

- A VPS with Ubuntu 24.04 (e.g. Hetzner CX22 ~€4/month)
- A domain name pointing to your VPS IP
- Docker installed on the VPS

### 1. Configure subdomains

In your DNS provider, add two A records:

| Record | Value |
|--------|-------|
| `yourdomain.com` | your VPS IP |
| `api.yourdomain.com` | your VPS IP |

### 2. Create production environment file

On the VPS, create `.env.production` (never commit this file):

```env
DB_USER=taskuser
DB_PASSWORD=your_strong_password
DB_NAME=taskmanager
JWT_SECRET=your_32_byte_hex_secret
CLIENT_URL=https://yourdomain.com
```

### 3. Update domain names

In `docker-compose.prod.yml`, replace `taskmanager.com` and `api.taskmanager.com` with your real domain.

In `traefik/traefik.yml`, replace `ton-email@example.com` with your real email.

### 4. Deploy

```bash
# Clone the project
git clone https://github.com/ZahraaBah/TaskManagementSystem.git
cd TaskManagementSystem

# Create required files
docker network create traefik-public
touch traefik/acme.json && chmod 600 traefik/acme.json

# Start all services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Run database migrations
docker compose -f docker-compose.prod.yml exec server npm run db:migrate
```

### 5. Verify deployment

```bash
curl https://api.yourdomain.com/health
# → {"status":"ok","environment":"production"}
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/taskmanager` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `a3f9...` (32 byte hex string) |
| `PORT` | Port the server runs on | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `CLIENT_URL` | Frontend URL for CORS | `https://yourdomain.com` |

---

## Migration Commands

```bash
cd server
npm run db:generate   # Generate migration files
npm run db:migrate    # Apply migrations
```

---

## Running Tests

### Backend

```bash
cd server
npm run test          # Run all tests
npm run test:auth     # Auth tests only
npm run test:tasks    # Tasks tests only
```

38 tests across 4 test files (unit + integration).

### Frontend

```bash
cd client
npx vitest run
```

6 tests across 2 test files (component tests).

### Code Quality

```bash
# Backend
cd server
npm run lint
npm run format:check

# Frontend
cd client
npm run lint
npm run format:check
```

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| POST | `/api/auth/register` | No | Register a new user | 201 |
| POST | `/api/auth/login` | No | Login and receive JWT | 200 |

### Tasks

| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| GET | `/api/tasks` | Yes | Get all user tasks | 200 |
| GET | `/api/tasks?completed=true` | Yes | Filter by status | 200 |
| POST | `/api/tasks` | Yes | Create a new task | 201 |
| PATCH | `/api/tasks/:id` | Yes | Update a task | 200 |
| DELETE | `/api/tasks/:id` | Yes | Delete a task | 200 |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Forbidden (not owner) |
| 404 | Not found |
| 409 | Conflict (e.g. email already exists) |
| 429 | Too many requests |
| 500 | Internal server error |

### Authentication Header

All protected routes require:

```
Authorization: Bearer <token>
```

### API Documentation

Swagger UI is available at `/api-docs` when the server is running.

---

## DTOs

### Auth (`auth.dto.ts`)

- `RegisterRequestDto` — Register payload
- `LoginRequestDto` — Login payload
- `AuthResponseDto` — Token + user on success
- `UserResponseDto` — Safe user object (no password)
- `ErrorResponseDto` — Standard error response
- `ValidationErrorDto` — Zod validation errors

### Tasks (`tasks.dto.ts`)

- `CreateTaskRequestDto` — Create task payload
- `UpdateTaskRequestDto` — Update task payload
- `TaskResponseDto` — Full task object in responses
- `ErrorResponseDto` — Standard error response
- `ValidationErrorDto` — Zod validation errors