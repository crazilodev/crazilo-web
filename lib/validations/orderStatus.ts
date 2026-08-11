export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

/**
 * Validates if an order status can transition to the requested status.
 */
export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  requestedStatus: OrderStatus
): boolean {
  if (currentStatus === requestedStatus) {
    return true
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus]
  return allowed ? allowed.includes(requestedStatus) : false
}

/**
 * Returns a list of allowed target statuses for a given current status.
 */
export function getAllowedOrderStatusTransitions(currentStatus: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[currentStatus] || []
}
