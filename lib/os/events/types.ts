export type ConfirmedBookingPayload = {
  id: string;
  guestCount: number;
  totalPrice: number | { toString(): string };
  guestPhone?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  reviewToken?: string | null;
  paymentReference?: string | null;
  activity: { title: string };
  slot: { startTime: Date };
  user?: { name: string | null; email: string } | null;
};

export type BookingCreatedPayload = {
  bookingId: string;
  activityId: string;
  slotId: string;
  guestCount: number;
  totalPrice: number;
  userId?: string | null;
};

export type BookingCancelledPayload = {
  bookingId: string;
  activityId: string;
  slotId: string;
  guestCount: number;
  reason?: string;
};

export type OSEventMap = {
  "booking.created": BookingCreatedPayload;
  "booking.confirmed": ConfirmedBookingPayload;
  "booking.cancelled": BookingCancelledPayload;
  "agent.invoked": {
    agentId: string;
    sessionId?: string;
    messageCount: number;
  };
  "agent.completed": {
    agentId: string;
    sessionId?: string;
    durationMs: number;
    usedTools: string[];
  };
  "agent.failed": {
    agentId: string;
    sessionId?: string;
    error: string;
  };
};

export type OSEventName = keyof OSEventMap;

export type OSEventHandler<K extends OSEventName> = (
  payload: OSEventMap[K]
) => void | Promise<void>;
