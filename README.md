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
- **ESLint** — Code linting
- **Prettier** — Code formatting
- **Vitest + Supertest** — Unit and integration tests
- **Docker + Docker Compose** — Containerized development environment

### Frontend

- **React** — UI framework
- **Vite** — Build tool
- **TypeScript** — Type-safe codebase
- **Tailwind CSS** — Utility-first styling
- **ESLint** — Code linting
- **Prettier** — Code formatting

---

## Folder Structure

```plaintext
TaskManagementSystem/
├── README.md
├── PROJECT DESIGN.md
├── TASK BREAKDOWN.md
├── docker-compose.yml
├── client/                     # React frontend (Vite + Tailwind)
└── server/
    ├── Dockerfile
    ├── drizzle.config.ts
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
                ├── tasks.dto.ts
                ├── tasks.service.test.ts
                └── tasks.routes.test.ts
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

## Code Quality

The project uses ESLint for linting and Prettier for code formatting to maintain consistent code style across the codebase.

### Linting and Formatting

#### Backend

```bash
cd server
npm run lint          # Check for linting issues
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run format:check  # Check if code is formatted
```

#### Frontend

```bash
cd client
npm run lint          # Check for linting issues
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run format:check  # Check if code is formatted
```

### VS Code Integration

The project includes VS Code workspace settings (`.vscode/settings.json`) that:

- Enable format on save with Prettier as the default formatter
- Run ESLint auto-fix on save
- Configure TypeScript import preferences
- Set up Tailwind CSS and Emmet support

Recommended extensions are listed in `.vscode/extensions.json` and will be suggested when opening the workspace.

---

## Setup Instructions

### Option A — Docker (Recommended)

#### Prerequisites

- Docker Desktop

```bash
git clone https://github.com/ZahraaBah/TaskManagementSystem.git
cd TaskManagementSystem
docker compose up --build
```

Server runs on `http://localhost:3000`

---

### Option B — Local Setup

#### Prerequisites

- Node.js v18+
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

#### 4. Create the database

```bash
psql -U postgres
CREATE DATABASE taskmanager;
\q
```

---

## Environment Variables

| Variable       | Description                       | Example                                                     |
| -------------- | --------------------------------- | ----------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string      | `postgresql://postgres:password@localhost:5432/taskmanager` |
| `JWT_SECRET`   | Secret key for signing JWT tokens | `a3f9...` (32 byte hex string)                              |
| `PORT`         | Port the server runs on           | `3000`                                                      |

---

## Migration Commands

Generate migration files:

```bash
cd server
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
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

## Running the Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Running Tests

### Backend

```bash
cd server
npm run test
```

38 tests across 4 test files (unit + integration).

To check code quality:

```bash
npm run lint
npm run format:check
```

### Frontend

```bash
cd client
npx vitest run
```

6 tests across 2 test files (component tests)

To check code quality:

```bash
npm run lint
npm run format:check
```

---

## API Endpoints

### Auth

| Method | Endpoint         | Auth | Description           | Success |
| ------ | ---------------- | ---- | --------------------- | ------- |
| POST   | `/auth/register` | No   | Register a new user   | 201     |
| POST   | `/auth/login`    | No   | Login and receive JWT | 200     |

### Tasks

| Method | Endpoint                | Auth | Description        | Success |
| ------ | ----------------------- | ---- | ------------------ | ------- |
| GET    | `/tasks`                | Yes  | Get all user tasks | 200     |
| GET    | `/tasks?completed=true` | Yes  | Filter by status   | 200     |
| POST   | `/tasks`                | Yes  | Create a new task  | 201     |
| PATCH  | `/tasks/:id`            | Yes  | Update a task      | 200     |
| DELETE | `/tasks/:id`            | Yes  | Delete a task      | 200     |

### HTTP Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Validation error                     |
| 401  | Not authenticated                    |
| 403  | Forbidden (not owner)                |
| 404  | Not found                            |
| 409  | Conflict (e.g. email already exists) |
| 500  | Internal server error                |

### Authentication Header

All protected routes require:

```plaintext
Authorization: Bearer <token>
```

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
