export type LoyaltyTransactionType = 'earn' | 'redeem';

export interface LoyaltyTransaction {
  id: string;
  type: LoyaltyTransactionType;
  points: number;
  orderId: string | null;
  createdAt: string;
}

/**
 * Shape assumed for `GET /loyalty/me` per docs/PROJECT-20-FEATURES-EXPANSION.md
 * section "A.6 — Tích điểm (Loyalty)" — the doc only names the endpoint, not
 * its exact response shape (backend built in parallel by another agent). If
 * the real response differs (e.g. flat `{ balance }` instead of `{ points }`,
 * or a separate `/loyalty/me/transactions` endpoint), only `LoyaltyService`
 * needs to change — this model and the UI consuming it stay the same shape.
 */
export interface LoyaltyAccount {
  points: number;
  transactions: LoyaltyTransaction[];
}
