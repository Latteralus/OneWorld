import type { CreateNotificationInput, Notification, NotificationRepository } from "../domain/notification.types.js";

/**
 * The Notifications domain's public write path (spec section 26.10).
 * Insert-only for Phase 2 - callers (worker-job orchestrators reacting to
 * an employment decision, a rent charge, etc.) create notifications
 * directly rather than through an outbox consumer, since no consumer
 * exists yet (see this package's README).
 */
export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  async create(input: CreateNotificationInput): Promise<Notification> {
    return this.repo.insertNotification(input);
  }
}
