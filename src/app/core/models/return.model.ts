export type ReturnReason = 'defective' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'refunded' | 'completed';

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  reason: ReturnReason;
  note: string | null;
  status: ReturnStatus;
  refundAmount: string | null;
  createdAt: string;
}

export interface CreateReturnPayload {
  orderId: string;
  orderItemId: string;
  reason: ReturnReason;
  note?: string;
}
