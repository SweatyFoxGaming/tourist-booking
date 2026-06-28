import { notifyBookingConfirmed } from "@/lib/booking-notifications";
import { eventBus } from "@/lib/os/events";
import { registerAgent } from "@/lib/os/agents/registry";
import { supportAgent } from "@/lib/os/agents/support/agent";
import { logger } from "@/lib/os/logger";

let bootstrapped = false;

export function bootstrapOS(): void {
  if (bootstrapped) {
    return;
  }

  bootstrapped = true;

  registerAgent(supportAgent);

  eventBus.on("booking.confirmed", async (booking) => {
    await notifyBookingConfirmed(booking);
  });

  logger.info("os.bootstrap", "AI OS bootstrapped", {
    agents: 1,
    eventListeners: eventBus.listenerCount(),
  });
}

if (typeof window === "undefined") {
  bootstrapOS();
}
