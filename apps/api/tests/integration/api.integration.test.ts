import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApplication } from '../../src/presentation/http/app.js';
import { Express } from 'express';

describe('API Integration Suite', () => {
  let app: Express;
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const appInstance = createApplication();
    app = appInstance.app;

    // Register a test user and get auth token
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'tester@personal-os.local',
        password: 'Password123!',
        name: 'Integration Tester'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    authToken = res.body.data.tokens.accessToken;
    userId = res.body.data.user.id;
  });

  describe('GET /health', () => {
    it('should return UP status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('UP');
      expect(res.body.data.service).toBe('personal-os-api');
    });
  });

  describe('Auth Endpoints', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'tester@personal-os.local',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('should return 422 on missing email or password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'tester@personal-os.local' });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('VALIDATION_FAILED');
    });
  });

  describe('Task Endpoints', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/tasks');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('should perform full task CRUD lifecycle', async () => {
      // 1. Create task
      const createRes = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Integration Test Task',
          priority: 'HIGH',
          cognitiveLoad: 3
        });

      expect(createRes.status).toBe(201);
      const taskId = createRes.body.data.id;
      expect(createRes.body.data.title).toBe('Integration Test Task');

      // 2. List tasks
      const listRes = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data).toHaveLength(1);

      // 3. Update task
      const updateRes = await request(app)
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'COMPLETED'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe('COMPLETED');

      // 4. Delete task
      const deleteRes = await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.deleted).toBe(true);
    });

    it('should return 422 if task title is missing', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(422);
    });
  });

  describe('Project Endpoints', () => {
    it('should create project and calculate health', async () => {
      const createRes = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Core System Project',
          description: 'Testing project endpoints'
        });

      expect(createRes.status).toBe(201);
      const projectId = createRes.body.data.id;

      // Add a task to project
      await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Task in Project', projectId, priority: 'MEDIUM' });

      // Calculate health
      const healthRes = await request(app)
        .post(`/api/v1/projects/${projectId}/calculate-health`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(healthRes.status).toBe(200);
      expect(healthRes.body.data.progressScore).toBeDefined();

      // Get single project
      const getRes = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.name).toBe('Core System Project');
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app)
        .get('/api/v1/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Event & AuditLog Endpoints', () => {
    it('should ingest events and query recent events', async () => {
      const ingestRes = await request(app)
        .post('/api/v1/events/ingest')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'github.pr.merged',
          source: 'GITHUB',
          sourceId: 'PR-99',
          payload: { repo: 'personal-os' }
        });

      expect(ingestRes.status).toBe(201);
      expect(ingestRes.body.data.type).toBe('github.pr.merged');

      const recentRes = await request(app)
        .get('/api/v1/events/recent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(recentRes.status).toBe(200);
      expect(recentRes.body.data).toHaveLength(1);
    });

    it('should record audit log automatically when task is created', async () => {
      await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Audit Test Task' });

      const auditRes = await request(app)
        .get('/api/v1/audit-logs?resource=Task')
        .set('Authorization', `Bearer ${authToken}`);

      expect(auditRes.status).toBe(200);
      expect(auditRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(auditRes.body.data[0].action).toBe('TASK_CREATED');
    });
  });
});
