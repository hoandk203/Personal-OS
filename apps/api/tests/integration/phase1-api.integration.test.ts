import { describe, it, expect, beforeAll } from 'vitest';
import supertest from 'supertest';
import { createApplication } from '../../src/presentation/http/app.js';
import { TaskStatus, Priority, ProjectStatus, SourceType } from '@personal-os/types';

describe('Phase 1 API Integration Suite', () => {
  let app: any;
  let request: any;
  let authToken: string;
  let taskId: string;
  let projectId: string;

  beforeAll(async () => {
    const instance = createApplication();
    app = instance.app;
    request = supertest(app);

    // Register user to obtain auth token
    const regRes = await request
      .post('/api/v1/auth/register')
      .send({
        email: 'phase1.user@example.com',
        password: 'Password123!',
        name: 'Phase 1 Engineer'
      });

    authToken = regRes.body.data.tokens.accessToken;
  });

  describe('Task Transitions & Advanced Query Endpoints', () => {
    it('should create a task and transition its status', async () => {
      const createRes = await request
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Automated Transition Test',
          priority: Priority.HIGH,
          cognitiveLoad: 4,
          source: {
            type: SourceType.GITHUB,
            externalReferenceId: 'PR #101',
            externalUrl: 'https://github.com/hoandk203/Personal-OS/pull/101'
          }
        });

      expect(createRes.status).toBe(201);
      taskId = createRes.body.data.id;

      // Transition to PLANNED
      const transitionRes = await request
        .post(`/api/v1/tasks/${taskId}/transition`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: TaskStatus.PLANNED,
          reason: 'Scheduled for today sprint'
        });

      expect(transitionRes.status).toBe(200);
      expect(transitionRes.body.data.status).toBe(TaskStatus.PLANNED);
    });

    it('should filter tasks with advanced query parameters', async () => {
      const res = await request
        .get('/api/v1/tasks?priority=HIGH&minCognitiveLoad=3&search=Transition')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return 422 when transition status is missing', async () => {
      const res = await request
        .post(`/api/v1/tasks/${taskId}/transition`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(422);
    });
  });

  describe('Project Endpoints (List, GetById, Delete)', () => {
    it('should create, get by id, and filter projects', async () => {
      const createRes = await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Phase 1 Integration Project',
          description: 'Testing project lifecycle',
          deadline: new Date(Date.now() + 864000000).toISOString(),
          tags: ['Integration', 'CleanArch']
        });

      expect(createRes.status).toBe(201);
      projectId = createRes.body.data.id;

      // Get by id
      const getRes = await request
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.name).toBe('Phase 1 Integration Project');

      // Filter list
      const listRes = await request
        .get('/api/v1/projects?status=ACTIVE')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThan(0);
    });

    it('should return 404 for missing project on GET and DELETE', async () => {
      const get404 = await request
        .get('/api/v1/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);
      expect(get404.status).toBe(404);

      const del404 = await request
        .delete('/api/v1/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);
      expect(del404.status).toBe(404);
    });

    it('should delete project successfully', async () => {
      const delRes = await request
        .delete(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.deleted).toBe(true);
    });
  });

  describe('Command Center Today Endpoints', () => {
    it('should set daily focus and get daily focus', async () => {
      const setRes = await request
        .post('/api/v1/today/focus')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2026-08-25',
          taskIds: [taskId]
        });

      expect(setRes.status).toBe(200);
      expect(setRes.body.data.focusTaskIds).toContain(taskId);

      const getRes = await request
        .get('/api/v1/today/focus?date=2026-08-25')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.focusTaskIds).toContain(taskId);
    });

    it('should toggle daily focus task', async () => {
      const toggleRes = await request
        .post('/api/v1/today/focus/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taskId,
          date: '2026-08-25'
        });

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.data.focusTaskIds).not.toContain(taskId); // Was toggled off
    });

    it('should get unified schedule and activity timeline', async () => {
      const schedRes = await request
        .get('/api/v1/today/schedule?date=2026-08-25')
        .set('Authorization', `Bearer ${authToken}`);

      expect(schedRes.status).toBe(200);
      expect(schedRes.body.data.blocks.length).toBeGreaterThan(0);

      const timeRes = await request
        .get('/api/v1/today/timeline?limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(timeRes.status).toBe(200);
      expect(timeRes.body.data.items).toBeInstanceOf(Array);
    });

    it('should return 422 when validation fails on today endpoints', async () => {
      const badFocus = await request
        .post('/api/v1/today/focus')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ taskIds: 'not-an-array' });
      expect(badFocus.status).toBe(422);

      const badToggle = await request
        .post('/api/v1/today/focus/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      expect(badToggle.status).toBe(422);
    });
  });

  describe('Connectors Endpoints', () => {
    it('should trigger GitHub sync and Calendar sync', async () => {
      const ghRes = await request
        .post('/api/v1/connectors/github/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ mockFallback: true });

      expect(ghRes.status).toBe(200);
      expect(ghRes.body.data.source).toBe(SourceType.GITHUB);
      expect(ghRes.body.data.itemsSynced).toBeGreaterThan(0);

      const calRes = await request
        .post('/api/v1/connectors/calendar/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: '2026-08-25', mockFallback: true });

      expect(calRes.status).toBe(200);
      expect(calRes.body.data.source).toBe(SourceType.GOOGLE_CALENDAR);
      expect(calRes.body.data.itemsSynced).toBeGreaterThan(0);
    });
  });
});
