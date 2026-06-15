import request from 'supertest';
import app from '../src/index';
import { cleanDatabase, disconnectDatabase } from './setup';

describe('Task Endpoints', () => {
  let token: string;
  let userId: string;

  const testUser = {
    name: 'Task Tester',
    email: 'task-tester@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    await cleanDatabase();
    // Create a user and get token
    const res = await request(app).post('/api/auth/signup').send(testUser);
    token = res.body.data.token;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabase();
  });

  const testTask = {
    title: 'Test Task',
    description: 'This is a test task',
    status: 'TODO',
    priority: 'MEDIUM',
  };

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(testTask);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(testTask.title);
      expect(res.body.data.status).toBe('TODO');
      expect(res.body.data.priority).toBe('MEDIUM');
      expect(res.body.data.userId).toBe(userId);
    });

    it('should reject task creation without title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No title task' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/tasks', () => {
    beforeAll(async () => {
      // Create multiple tasks for pagination/filter testing
      const tasks = [
        { title: 'Alpha Task', status: 'TODO', priority: 'LOW' },
        { title: 'Beta Task', status: 'IN_PROGRESS', priority: 'MEDIUM' },
        { title: 'Gamma Task', status: 'DONE', priority: 'HIGH' },
        { title: 'Delta Task', status: 'TODO', priority: 'HIGH' },
        { title: 'Search Target', status: 'TODO', priority: 'LOW' },
      ];

      for (const task of tasks) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send(task);
      }
    });

    it('should list tasks with pagination', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=3')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(3);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(3);
      expect(res.body.pagination.total).toBeGreaterThan(0);
      expect(res.body.pagination.totalPages).toBeGreaterThan(0);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=TODO')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // All returned tasks should be TODO
      for (const task of res.body.data) {
        expect(task.status).toBe('TODO');
      }
    });

    it('should search tasks by title', async () => {
      const res = await request(app)
        .get('/api/tasks?search=Search Target')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toContain('Search Target');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    let taskId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Update Me', status: 'TODO', priority: 'LOW' });
      taskId = res.body.data.id;
    });

    it('should update a task', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title', status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Delete Me' });
      taskId = res.body.data.id;
    });

    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toContain('deleted');

      // Verify task is gone
      const getRes = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe('Ownership Isolation', () => {
    it('should not allow access to another user\'s tasks', async () => {
      // Create task as original user
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Private Task' });
      const taskId = createRes.body.data.id;

      // Create a second user
      const user2Res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Other User', email: 'other@example.com', password: 'password123' });
      const token2 = user2Res.body.data.token;

      // Try to access first user's task as second user
      const getRes = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(getRes.status).toBe(403);
    });
  });
});
