# TaskManagementSystem

A full-stack multi-user task management application with authentication, ownership enforcement, and automated tests.

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
- **Vitest + Supertest** — Unit and integration tests

---

## Folder Structure

```
task-manager/
├── README.md
├── PROJECT_DESIGN.md
├── TASK_BREAKDOWN.md
└── server/
    ├── drizzle.config.ts       # Drizzle ORM configuration
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    └── src/
        ├── app.ts              # Express app setup
        ├── server.ts           # Server entry point
        ├── db/
        │   ├── schema.ts       # Database schema (users + tasks)
        │   └── index.ts        # Database connection
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
                └── tasks.dto.ts
```

---

## Architecture

The backend follows a strict layered architecture:

- **Controllers** → Handle HTTP only (parse request, send response)
- **Services** → Contain all business logic
- **Repositories** → Handle all database access
- **DTOs** → Define the shape of all request payloads and API responses
- **Schemas** → Zod validation for all incoming data

No database calls are made in controllers. No business logic lives in repositories.

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL v14+

### 1. Clone the repository
```bash
git clone https://github.com/ZahraaBah/TaskManagementSystem.git
cd TaskManagementSystem
```

### 2. Install backend dependencies
```bash
cd server
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskmanager
JWT_SECRET=your_jwt_secret_here
PORT=3000
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Create the database
```bash
psql -U postgres
CREATE DATABASE taskmanager;
\q
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/taskmanager` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `a3f9...` (32 byte hex string) |
| `PORT` | Port the server runs on | `3000` |

---

## Migration Commands

Push schema directly to database:
```bash
cd server
npx drizzle-kit push --config=drizzle.config.ts
```

---

## Running the Server

Development mode (with hot reload):
```bash
cd server
npm run dev
```

Server runs on `http://localhost:3000`

Health check: `GET http://localhost:3000/health`

---

## Running Tests

```bash
cd server
npm run test
```

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description | Success |
|---|---|---|---|---|
| POST | `/auth/register` | No | Register a new user | 201 |
| POST | `/auth/login` | No | Login and receive JWT | 200 |

### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Not authenticated |
| 409 | Conflict (e.g. email already exists) |
| 500 | Internal server error |

### Authentication Header

All protected routes require:
```
Authorization: Bearer <token>
```

---

## DTOs

All API requests and responses conform to typed DTOs defined in `auth.dto.ts`:

- `RegisterRequestDto` — Register payload
- `LoginRequestDto` — Login payload
- `AuthResponseDto` — Token + user on success
- `UserResponseDto` — Safe user object (no password)
- `ErrorResponseDto` — Standard error response
- `ValidationErrorDto` — Zod validation errors
