import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '../../app';
import { db } from '../../db';
import { users, tasks } from '../../db/schema';
import { eq } from 'drizzle-orm';

const request = supertest(app);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const testUser = { email: 'tasks@test.com', password: 'password123' };
const otherUser = { email: 'other@test.com', password: 'password123' };

let token: string;
let otherToken: string;
let taskId: string;

const cleanupUsers = async () => {
  await db.delete(users).where(eq(users.email, testUser.email));
  await db.delete(users).where(eq(users.email, otherUser.email));
};

// ─── SETUP ───────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await cleanupUsers();

  const res1 = await request.post('/auth/register').send(testUser);
  token = res1.body.token;

  const res2 = await request.post('/auth/register').send(otherUser);
  otherToken = res2.body.token;
});

afterAll(async () => {
  await cleanupUsers();
});

beforeEach(async () => {
  await db.delete(tasks);
  const res = await request
    .post('/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test task', description: 'Test description' });
  taskId = res.body.id;
});

// ─── GET /tasks ───────────────────────────────────────────────────────────────

describe('GET /tasks', () => {
  it('should return 401 without token', async () => {
    const res = await request.get('/tasks');
    expect(res.status).toBe(401);
  });

  it('should return only the authenticated user tasks', async () => {
    const res = await request
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Test task');
  });

  it('should filter tasks by completed status', async () => {
    const res = await request
      .get('/tasks?completed=false')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0].completed).toBe(false);
  });

  it('response should conform to TaskResponseDto', async () => {
    const res = await request
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      completed: expect.any(Boolean),
      userId: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});

// ─── POST /tasks ──────────────────────────────────────────────────────────────

describe('POST /tasks', () => {
  it('should return 401 without token', async () => {
    const res = await request.post('/tasks').send({ title: 'Task' });
    expect(res.status).toBe(401);
  });

  it('should create a task and return 201', async () => {
    const res = await request
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New task', description: 'Description' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New task');
    expect(res.body.userId).toBeDefined();
  });

  it('should return 400 if title is missing', async () => {
    const res = await request
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'No title' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

// ─── PATCH /tasks/:id ─────────────────────────────────────────────────────────

describe('PATCH /tasks/:id', () => {
  it('should return 401 without token', async () => {
    const res = await request.patch(`/tasks/${taskId}`).send({ title: 'Updated' });
    expect(res.status).toBe(401);
  });

  it('should update task if user owns it', async () => {
    const res = await request
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated title', completed: true });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated title');
    expect(res.body.completed).toBe(true);
  });

  it('should return 403 if user does not own the task', async () => {
    const res = await request
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hacked' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });
});

// ─── DELETE /tasks/:id ────────────────────────────────────────────────────────

describe('DELETE /tasks/:id', () => {
  it('should return 401 without token', async () => {
    const res = await request.delete(`/tasks/${taskId}`);
    expect(res.status).toBe(401);
  });

  it('should delete task if user owns it', async () => {
    const res = await request
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(taskId);
  });

  it('should return 403 if user does not own the task', async () => {
    const res = await request
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });
});