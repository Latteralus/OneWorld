import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import type { PlayerId } from "@oneworld/contracts";
import type {
  CreateNotificationInput,
  Notification,
  NotificationRepository,
  NotificationType,
} from "../domain/notification.types.js";

function toDomainNotification(row: typeof schema.notifications.$inferSelect): Notification {
  return {
    id: row.id,
    playerId: row.playerId as PlayerId,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    relatedType: row.relatedType ?? undefined,
    relatedId: row.relatedId ?? undefined,
    readState: row.readState,
    createdAt: row.createdAt,
  };
}

/** Postgres-backed `NotificationRepository`. */
export class DrizzleNotificationRepository implements NotificationRepository {
  constructor(private readonly db: DbOrTx) {}

  async insertNotification(input: CreateNotificationInput): Promise<Notification> {
    const [inserted] = await this.db
      .insert(schema.notifications)
      .values({
        playerId: input.playerId,
        type: input.type,
        title: input.title,
        body: input.body,
        relatedType: input.relatedType,
        relatedId: input.relatedId,
      })
      .returning();
    if (!inserted) throw new Error("Failed to create notification");
    return toDomainNotification(inserted);
  }
}
