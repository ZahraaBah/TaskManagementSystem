# Backend Test Coverage Report

Generated: 2026-03-18

## 1. Run command

- `cd server`
- `npm run test -- --coverage`

## 2. Environment

- `vitest` v4.1.0
- `@vitest/coverage-v8` + `vitest.config.ts` coverage provider `v8`
- `.env.test` expected to contain `DATABASE_URL` pointing to a test DB URL containing `_test`

## 3. Outcome

- All test files were discovered and executed, but each test suite skipped all tests due to database connection failure.
- No coverage data could be produced because initialization failed before tests could run.

## 4. Error details

- Error source: `server/src/test/setup.ts` `beforeAll()` tries `db.execute(sql`SELECT 1`);`
- Exception: `DrizzleQueryError: Failed query: SELECT 1`, cause: `ECONNREFUSED`
- This indicates POSTGRES is not running/accessible at `process.env.DATABASE_URL`.

## 5. Suites seen

- `src/modules/auth/auth.service.test.ts` -> 10 tests (all skipped)
- `src/modules/auth/auth.routes.test.ts` -> 10 tests (all skipped)
- `src/modules/tasks/tasks.service.test.ts` -> 8 tests (all skipped)
- `src/modules/tasks/tasks.routes.test.ts` -> 12 tests (all skipped)

## 6. Coverage output

- Reporters configured: `text`, `json`, `html`
- No coverage report generated due the DB setup failure.

## 7. Recommended fix path

1. Start Postgres for tests (local or docker):
   - `docker compose up --build` (root compose has postgres service)
   - or local Postgres, create `taskmanager_test` DB
2. Confirm `server/.env.test` has:
   - `DATABASE_URL=postgresql://postgres:<password>@localhost:5432/taskmanager_test`
   - `JWT_SECRET=...` 
   - `PORT=3001` (or whatever)
3. Verify with:
   - `psql "$DATABASE_URL" -c "SELECT 1"`
4. Run migrations on test DB:
   - `npm run db:migrate` (or `npm run test:all` if defined)
5. Re-run coverage: `npm run test -- --coverage`

## 8. Expected coverage metrics (post-fix)

- lines: 90%+ (target)
- branches: 80%+ (target)
- functions: 90%+ (target)
- statements: 90%+ (target)

## 9. Notes

- This report is an operational status report showing why coverage is absent; no code assertions were evaluated.
- After database availability is restored, the report can be refreshed with actual coverage values and HTML artifacts in `coverage/`.
