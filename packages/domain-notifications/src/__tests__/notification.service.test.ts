import { describe, expect, it } from "vitest";
import type { PlayerId } from "@oneworld/contracts";
import { NotificationService } from "../application/notification.service.js";
import { InMemoryNotificationRepository } from "../infrastructure/notification.repository.memory.js";

describe("NotificationService.create", () => {
  it("creates an unread notification", async () => {
    const repo = new InMemoryNotificationRepository();
    const service = new NotificationService(repo);
    const playerId = "player-1" as PlayerId;

    const notification = await service.create({
      playerId,
      type: "employment_decision",
      title: "Application accepted",
      body: "Your application for Dishwasher was accepted.",
      relatedType: "job_application",
      relatedId: "app-1",
    });

    expect(notification.playerId).toBe(playerId);
    expect(notification.readState).toBe(false);
    expect(repo.listAll()).toHaveLength(1);
  });
});
