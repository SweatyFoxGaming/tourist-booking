import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Tourist Booking",
  description: "How Tourist Booking collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div>
      <section className="border-b border-gray-200 bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-[var(--color-text)]">Privacy Policy</h1>
          <p className="mt-3 text-gray-500">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            When you book an activity, we collect your name, email address, booking details,
            and payment information (processed securely by Stripe — we do not store card numbers).
            If you create an account, we also store your login credentials in encrypted form.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            We use your information to process bookings, send confirmations, allow you to
            look up or cancel reservations, and — if you choose — submit reviews. We may
            share your name and contact details with activity providers solely to fulfil
            your booking.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">3. Data Retention</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Booking records are retained for accounting, support, and legal purposes.
            You may request deletion of your account data by contacting us, subject to
            obligations to retain transaction records.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">4. Cookies & Analytics</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            We use essential cookies for authentication when you sign in. We do not sell
            your personal data to third parties.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">5. Your Rights</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            You may request access to, correction of, or deletion of your personal data
            by emailing support@touristbooking.com. EU/UK residents may have additional
            rights under GDPR.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">6. Contact</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Questions about this policy? Visit our{" "}
            <Link href="/contact" className="text-[var(--color-primary)] hover:underline">
              contact page
            </Link>{" "}
            or email support@touristbooking.com.
          </p>
        </section>
      </article>
    </div>
  );
}
