import { notifyBookingConfirmed } from "@/lib/booking-notifications";
import { eventBus } from "@/lib/os/events";
import { registerAgent } from "@/lib/os/agents/registry";
import { supportAgent } from "@/lib/os/agents/support/agent";
import { logger } from "@/lib/os/logger";
import { jobQueue } from "@/lib/os/queue";

let bootstrapped = false;

export function bootstrapOS(): void {
  if (bootstrapped) {
    return;
  }

  bootstrapped = true;

  registerAgent(supportAgent);

  eventBus.on("booking.confirmed", (booking) => {
    jobQueue.enqueue({
      name: "notify-booking-confirmed",
      handler: () => notifyBookingConfirmed(booking),
      maxAttempts: 3,
    });
  });

  eventBus.on("booking.cancelled", (payload) => {
    logger.info("os.bootstrap", "Booking cancelled", {
      bookingId: payload.bookingId,
      activityId: payload.activityId,
    });
  });

  logger.info("os.bootstrap", "AI OS bootstrapped", {
    agents: 1,
    eventListeners: eventBus.listenerCount(),
  });
}

if (typeof window === "undefined") {
  bootstrapOS();
}
