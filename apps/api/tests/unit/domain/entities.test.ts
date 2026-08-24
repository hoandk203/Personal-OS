import { describe, it, expect } from 'vitest';
import { UserEntity } from '../../../src/core/domain/entities/user.entity.js';
import { TaskEntity } from '../../../src/core/domain/entities/task.entity.js';
import { ProjectEntity } from '../../../src/core/domain/entities/project.entity.js';
import { EventEntity } from '../../../src/core/domain/entities/event.entity.js';
import { AuditLogEntity } from '../../../src/core/domain/entities/audit-log.entity.js';
import { DecisionEntity } from '../../../src/core/domain/entities/decision.entity.js';
import { RecommendationEntity } from '../../../src/core/domain/entities/recommendation.entity.js';
import { NotificationEntity } from '../../../src/core/domain/entities/notification.entity.js';
import { TaskStatus, Priority, ProjectStatus, SourceType, ActorType, RecommendationType, NotificationTier } from '@personal-os/types';
import { DomainError } from '@personal-os/shared';

describe('Domain Entities Suite', () => {
  describe('UserEntity', () => {
    it('should create valid user and update profile', () => {
      const user = new UserEntity('u-1', 'test@example.com', 'Test User', 'hash123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');

      user.updateProfile('New Name');
      expect(user.name).toBe('New Name');
    });

    it('should throw DomainError on invalid email or empty name', () => {
      expect(() => new UserEntity('u-1', 'invalid-email', 'Name', 'hash')).toThrow(DomainError);
      expect(() => new UserEntity('u-1', 'valid@email.com', '  ', 'hash')).toThrow(DomainError);
    });
  });

  describe('TaskEntity', () => {
    it('should manage task lifecycle transitions and completion date', () => {
      const task = new TaskEntity('t-1', 'u-1', null, 'Implement Clean Arch', null, TaskStatus.INBOX, Priority.HIGH);
      expect(task.status).toBe(TaskStatus.INBOX);
      expect(task.completedAt).toBeNull();

      task.moveToStatus(TaskStatus.IN_PROGRESS);
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);

      task.moveToStatus(TaskStatus.COMPLETED);
      expect(task.status).toBe(TaskStatus.COMPLETED);
      expect(task.completedAt).toBeInstanceOf(Date);

      // Reopen task
      task.moveToStatus(TaskStatus.IN_PROGRESS);
      expect(task.completedAt).toBeNull();
    });

    it('should calculate isOverdue correctly', () => {
      const pastDate = new Date(Date.now() - 100000);
      const futureDate = new Date(Date.now() + 100000);

      const overdueTask = new TaskEntity('t-1', 'u-1', null, 'Overdue', null, TaskStatus.PLANNED, Priority.HIGH, pastDate);
      expect(overdueTask.isOverdue()).toBe(true);

      overdueTask.moveToStatus(TaskStatus.COMPLETED);
      expect(overdueTask.isOverdue()).toBe(false);

      const futureTask = new TaskEntity('t-2', 'u-1', null, 'Future', null, TaskStatus.PLANNED, Priority.HIGH, futureDate);
      expect(futureTask.isOverdue()).toBe(false);
    });

    it('should manage cognitive load and duration', () => {
      const task = new TaskEntity('t-1', 'u-1', null, 'Title', null, TaskStatus.INBOX, Priority.MEDIUM, null, 60, null, 2);
      expect(task.cognitiveLoad).toBe(2);

      task.cognitiveLoad = 4;
      expect(task.cognitiveLoad).toBe(4);

      task.recordActualDuration(45);
      expect(task.actualDurationMinutes).toBe(45);

      expect(() => task.recordActualDuration(-5)).toThrow(DomainError);
    });

    it('should disallow unarchiving without proper state', () => {
      const task = new TaskEntity('t-1', 'u-1', null, 'Archived task', null, TaskStatus.ARCHIVED);
      expect(() => task.moveToStatus(TaskStatus.INBOX)).toThrow(DomainError);
    });
  });

  describe('ProjectEntity', () => {
    it('should create project and allow status changes', () => {
      const project = new ProjectEntity('p-1', 'u-1', 'Personal OS', 'Core product', ProjectStatus.ACTIVE);
      expect(project.name).toBe('Personal OS');

      project.changeStatus(ProjectStatus.PAUSED);
      expect(project.status).toBe(ProjectStatus.PAUSED);
    });

    it('should throw on empty project name', () => {
      expect(() => new ProjectEntity('p-1', 'u-1', '')).toThrow(DomainError);
    });
  });

  describe('EventEntity', () => {
    it('should create normalized event and mark processed', () => {
      const event = new EventEntity('e-1', 'u-1', 'github.pull_request.opened', SourceType.GITHUB, 'PR-1', { repo: 'personal-os' });
      expect(event.processedAt).toBeNull();

      event.markProcessed();
      expect(event.processedAt).toBeInstanceOf(Date);
    });

    it('should throw on empty event type', () => {
      expect(() => new EventEntity('e-1', 'u-1', '', SourceType.GITHUB, 'PR-1')).toThrow(DomainError);
    });
  });

  describe('Decision, Recommendation, Notification, AuditLog Entities', () => {
    it('should instantiate and operate correctly', () => {
      const decision = new DecisionEntity('d-1', 'u-1', 'p-1', 'Use Clean Arch', 'Need maintainability', ['Clean Arch', 'NestJS'], 'Clean Arch', 'Zero lock-in', [], 0.9, 'Easy testing');
      expect(decision.confidence).toBe(0.9);
      decision.evaluateOutcome('Positive testing outcome', 'Successful architecture');
      expect(decision.actualOutcome).toBe('Positive testing outcome');

      const rec = new RecommendationEntity('r-1', 'u-1', RecommendationType.WORKLOAD_RISK, 'Heavy Day', 'High load', '4 meetings');
      expect(rec.isApplied).toBe(false);
      rec.apply();
      expect(rec.isApplied).toBe(true);

      const notif = new NotificationEntity('n-1', 'u-1', NotificationTier.IMPORTANT, 'Alert', 'PR waiting');
      expect(notif.isRead).toBe(false);
      notif.markAsRead();
      expect(notif.isRead).toBe(true);

      const audit = new AuditLogEntity('a-1', 'u-1', ActorType.USER, 'CREATE_TASK', 'Task', 't-1');
      expect(audit.actor).toBe(ActorType.USER);
    });
  });
});
