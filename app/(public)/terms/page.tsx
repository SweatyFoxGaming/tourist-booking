import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Tourist Booking",
  description:
    "Terms and conditions for booking tourist activities through Tourist Booking.",
};

const sections = [
  {
    title: "1. Introduction",
    content: `These Terms and Conditions ("Terms") govern your use of the Tourist Booking website and your booking of activities through our platform. By making a booking, you agree to these Terms. Please read them carefully before proceeding.`,
  },
  {
    title: "2. Bookings",
    content: `When you book an activity, you enter into a contract with the activity provider for the delivery of that experience. Tourist Booking acts as a booking agent facilitating the reservation and payment process. All bookings are subject to availability and confirmation.`,
  },
  {
    title: "3. Payments",
    content: `Full payment is required at the time of booking unless otherwise stated. Prices are displayed in USD and include applicable taxes where indicated. Payments are processed securely through our payment provider. You will receive an email confirmation upon successful payment.`,
  },
  {
    title: "4. Cancellations & Refunds",
    content: `Cancellation policies may vary by activity. Where cancellation is permitted, refunds will be processed according to the policy displayed at the time of booking. To cancel a booking, contact us at support@touristbooking.com with your booking reference. No-shows may not be eligible for a refund.`,
  },
  {
    title: "5. Guest Bookings",
    content: `You may book as a guest without creating an account by providing your name and a valid email address. You are responsible for ensuring your contact details are correct so that we can send booking confirmations and important updates.`,
  },
  {
    title: "6. Activity Participation",
    content: `You are responsible for arriving on time at the specified meeting point. Some activities may have age, fitness, or health requirements — please review the activity description before booking. Providers reserve the right to refuse participation if safety requirements are not met.`,
  },
  {
    title: "7. Liability",
    content: `Tourist Booking is not liable for acts, errors, omissions, or negligence of activity providers, nor for personal injury, loss, or damage arising from participation in booked activities, except where required by applicable law. Activity providers are responsible for the safe delivery of their experiences.`,
  },
  {
    title: "8. Reviews",
    content: `Registered users who have completed a confirmed booking may submit reviews. Reviews must be honest, relevant, and respectful. We reserve the right to remove reviews that violate our community guidelines or contain inappropriate content.`,
  },
  {
    title: "9. Privacy",
    content: `We collect and use personal information solely to process bookings, send confirmations, and improve our service. We do not sell your data to third parties. Contact details are shared with activity providers only as necessary to fulfil your booking.`,
  },
  {
    title: "10. Changes to These Terms",
    content: `We may update these Terms from time to time. The version in effect at the time of your booking applies to that booking. Continued use of the site after changes constitutes acceptance of the updated Terms.`,
  },
  {
    title: "11. Contact",
    content: `For questions about these Terms or your booking, contact us at support@touristbooking.com.`,
  },
];

export default function TermsPage() {
  return (
    <div>
      <section className="border-b border-gray-200 bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-[var(--color-text)]">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-gray-500">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-gray-600 leading-relaxed">
          These terms apply to all bookings made through Tourist Booking. By using our
          site and completing a booking, you confirm that you have read and agree to
          these Terms & Conditions.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {section.title}
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-gray-200 pt-8 text-sm text-gray-500">
          Return to{" "}
          <Link href="/" className="text-[var(--color-primary)] hover:underline">
            Home
          </Link>
          {" · "}
          <Link href="/activities" className="text-[var(--color-primary)] hover:underline">
            Activities
          </Link>
          {" · "}
          <Link href="/about" className="text-[var(--color-primary)] hover:underline">
            About Us
          </Link>
        </p>
      </article>
    </div>
  );
}
