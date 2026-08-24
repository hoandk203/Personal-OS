import { NotificationTier, Notification as INotification } from '@personal-os/types';

export class NotificationEntity implements INotification {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly tier: NotificationTier,
    public title: string,
    public message: string,
    public resourceType: string | null = null,
    public resourceId: string | null = null,
    public isRead: boolean = false,
    readonly createdAt: Date = new Date()
  ) {}

  markAsRead(): void {
    this.isRead = true;
  }
}
