import type { Metadata } from "next";
import BookingLookupClient from "./lookup-page";

export const metadata: Metadata = {
  title: "Find Your Booking | Tourist Booking",
  description: "Look up or cancel your booking using your email and booking reference.",
};

export default function BookingLookupPage() {
  return <BookingLookupClient />;
}
