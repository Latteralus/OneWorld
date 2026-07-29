export interface AuditLogEntry {
  id: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  beforeSummary?: Record<string, unknown>;
  afterSummary?: Record<string, unknown>;
  requestId?: string;
  createdAt: Date;
}

/**
 * A compensating action is an audited, explicit correction - never a
 * silent balance edit (spec section 28.3: "Never fix money by silently
 * editing a balance. Use audited adjustments.").
 */
export interface CompensatingAction {
  reason: string;
  performedBy: string;
  entityType: string;
  entityId: string;
  correctionLedgerEntryId?: string;
}
