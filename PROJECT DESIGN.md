# PROJECT DESIGN - Multi-User Task Manager (Production Warmup)

## Objective

Build a full-stack, multi-user task management system with:

* Authentication
* Ownership enforcement
* Clean layered architecture
* Full TypeScript discipline
* Documentation
* Automated tests

---

## Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* React Testing Library
* Vitest

### Backend

* Express
* TypeScript
* PostgreSQL
* Drizzle ORM
* Zod
* bcrypt
* JWT
* Vitest or Jest
* Supertest

---

## Architecture Requirements

### Backend Structure

```plaintext
/server
  /src
    /db
      schema.ts
      index.ts
    /modules
      /auth
        auth.controller.ts
        auth.service.ts
        auth.routes.ts
        auth.schema.ts
        auth.dto.ts
        auth.middleware.ts
      /tasks
        tasks.controller.ts
        tasks.service.ts
        tasks.repository.ts
        tasks.routes.ts
        tasks.schema.ts
        tasks.dto.ts
    app.ts
    server.ts
```

### Architecture Rules

* Controllers → HTTP only
* Services → business logic
* Repositories → DB access
* No DB calls in controllers
* No `any`
* Zod validation for all input
* DTOs (Data Transfer Objects) must be used for both all incoming requests and outgoing responses in the backend, defined per module (e.g., `auth.dto.ts`, `tasks.dto.ts`) and enforced across the codebase.

---

## Database Design

### users

* id (uuid)
* email (unique, not null)
* password
* createdAt

### tasks

* id (uuid)
* title (not null)
* description (nullable)
* completed (boolean default false)
* userId (foreign key → users.id)
* createdAt
* updatedAt

Requirements:

* Proper constraints
* Foreign key enforced
* Timestamps implemented
* Migrations used (no manual DB edits)

---

## 🔐 Authentication & Authorization

* Register
* Login
* JWT-based authentication
* Password hashing with bcrypt
* Protected routes
* Ownership enforcement at query level

Must differentiate:

* 401 → Not authenticated
* 403 → Authenticated but forbidden

---

## 📚 Documentation Requirements

### Docstrings Required For

* All service methods
* Complex utility functions
* Middleware with logic

Each docstring must include:

* Purpose
* Parameters
* Return type
* Possible errors

---

### README Must Include

* Project overview
* Tech stack
* Folder structure explanation
* Setup instructions
* Environment variables
* Migration commands
* How to run server
* How to run frontend
* How to run tests
* API endpoint summary
* Architecture explanation

If README cannot reproduce the project → incomplete.

---

# 📄 FINAL PROJECT BRIEF (Ready to Send)

---

## Project: Multi-User Task Manager

### Objective

Build a full-stack task management application supporting authentication, ownership enforcement, documentation, and automated tests.

---

## Functional Requirements

### Authentication

* Register with email and password
* Login
* Password hashing
* JWT authentication
* Protected routes

### Tasks

Authenticated users must be able to:

* Create tasks
* View only their own tasks
* Update their own tasks
* Delete their own tasks
* Filter tasks by completed status

---

## Technical Requirements

* Layered backend architecture
* Zod validation
* Drizzle migrations
* Type-safe codebase
* No `any`
* Proper HTTP status codes
* Ownership enforced in database queries
* Clean Git history
* DTOs enforced for all backend request payloads and response objects. All request bodies and API responses MUST adhere to module-defined DTO (Data Transfer Object) types.

---

## Documentation Requirements

* Docstrings in services
* Clear README
* Setup instructions must work
* API documented
* All DTOs documented.

---

## Testing Requirements

You must implement:

Backend:

* Unit tests (services)
* Integration tests (API routes)

Frontend:

* Component tests
* Protected route test

Tests must pass before submission.

---

## Deliverables

* Git repository
* Passing tests
* Working application
* Clean README
* Professional structure

---

# 🧪 TESTING REQUIREMENTS (Clear Expectations)

## Backend

### Unit Tests (Required)

Test:

* Auth service

  * Password hashing
  * Password comparison
  * JWT generation
* Task service

  * Task creation
  * Task filtering by user
  * Ownership enforcement

Unit tests must:

* Test logic, not Express
* Mock repository layer where appropriate

---

### Integration Tests (Required)

Using Supertest:

Must test:

* POST /auth/register → 201
* POST /auth/login → returns token
* GET /tasks without token → 401
* POST /tasks with token → 201
* GET /tasks returns only user's tasks
* Accessing another user's task → 403

Integration tests must:

* Hit real routes
* Use test database
* Not mock everything
* Validate request and response DTOs are strictly enforced and tested, including error DTOs.

---

## Frontend

Must include:

* TaskList renders tasks
* ProtectedRoute blocks unauthenticated user
* At least one interaction test (e.g., mark task complete)

Do not:

* Test implementation details
* Overuse snapshots

---

## Minimum Standard

* Tests must assert behavior
* Tests must fail if logic breaks
* Clear separation between unit and integration

---

# 🔍 FINAL CODE REVIEW CHECKLIST

## Architecture

* [ ] Proper layered structure
* [ ] No DB access in controllers
* [ ] No massive files
* [ ] Clean modular separation

---

## TypeScript

* [ ] No `any`
* [ ] Proper return types
* [ ] Types inferred from schema
* [ ] Zod validation used
* [ ] All backend input and output enforced via DTOs

---

## Security

* [ ] Passwords hashed
* [ ] JWT secret in env
* [ ] Protected routes enforced
* [ ] Ownership checked in DB queries
* [ ] No password in responses

---

## Database

* [ ] Proper constraints
* [ ] Foreign keys implemented
* [ ] Migrations used
* [ ] Indexes where appropriate

---

## Documentation

* [ ] Docstrings complete
* [ ] README clear and reproducible
* [ ] Environment variables documented
* [ ] API endpoints listed
* [ ] DTOs documented

---

## Testing

* [ ] Unit tests implemented
* [ ] Integration tests implemented
* [ ] Frontend tests implemented
* [ ] Meaningful assertions
* [ ] Unauthorized access tested
* [ ] Ownership enforcement tested
* [ ] API requests and responses conform to DTOs

---

## Code Quality

* [ ] Clear naming
* [ ] No dead code
* [ ] No console logs
* [ ] Clean formatting
* [ ] Small focused functions
