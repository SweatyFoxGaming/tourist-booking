import type { Metadata } from "next";
import ContactPageClient from "./ContactPage";

export const metadata: Metadata = {
  title: "Contact Us | Tourist Booking",
  description: "Get in touch with Tourist Booking for support, bookings, or partnerships.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
