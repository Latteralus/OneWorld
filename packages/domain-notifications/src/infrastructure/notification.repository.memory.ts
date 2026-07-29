import type {
  CreateNotificationInput,
  Notification,
  NotificationRepository,
} from "../domain/notification.types.js";

let sequence = 0;
function nextId(): string {
  sequence += 1;
  return `mem-notification-${sequence}`;
}

/**
 * In-memory `NotificationRepository` for unit tests and local prototyping
 * (spec section 20.4). The Postgres-backed implementation lives in
 * `notification.repository.drizzle.ts` and must uphold the same contract.
 */
export class InMemoryNotificationRepository implements NotificationRepository {
  private readonly notifications: Notification[] = [];

  async insertNotification(input: CreateNotificationInput): Promise<Notification> {
    const notification: Notification = {
      id: nextId(),
      playerId: input.playerId,
      type: input.type,
      title: input.title,
      body: input.body,
      relatedType: input.relatedType,
      relatedId: input.relatedId,
      readState: false,
      createdAt: new Date(),
    };
    this.notifications.push(notification);
    return notification;
  }

  listAll(): Notification[] {
    return [...this.notifications];
  }
}
