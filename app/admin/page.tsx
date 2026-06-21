import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAdminAnalytics } from "@/lib/admin-analytics";
import { formatPrice } from "@/lib/utils";
import {
  AdminStatCard,
  BookingTrendChart,
  StatusBreakdown,
  TopActivitiesTable,
} from "@/components/admin/AnalyticsCharts";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { getWhatsAppBusinessNumber } from "@/lib/whatsapp-public";

export default async function AdminDashboard() {
  const analytics = await getAdminAnalytics();
  const whatsAppLive = isWhatsAppConfigured();
  const whatsAppNumber = getWhatsAppBusinessNumber();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="mt-1 text-slate-300">
            Bookings, revenue, and platform performance at a glance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={whatsAppLive ? "success" : "warning"}>
            WhatsApp {whatsAppLive ? "connected" : "not configured"}
          </Badge>
          {whatsAppNumber && (
            <Badge variant="outline">+{whatsAppNumber}</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total revenue"
          value={formatPrice(analytics.totalRevenue)}
          hint={`${analytics.confirmedCount} confirmed bookings`}
          accent="emerald"
        />
        <AdminStatCard
          label="This month"
          value={formatPrice(analytics.monthRevenue)}
          hint={`${analytics.monthBookingCount} bookings`}
          accent="blue"
        />
        <AdminStatCard
          label="Today"
          value={analytics.todayBookings}
          hint={`${analytics.weekBookingCount} this week`}
          accent="amber"
        />
        <AdminStatCard
          label="Avg. booking value"
          value={formatPrice(analytics.avgBookingValue)}
          hint={
            analytics.reviewCount > 0
              ? `${analytics.avgRating.toFixed(1)}★ from ${analytics.reviewCount} reviews`
              : "No reviews yet"
          }
          accent="rose"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 xl:col-span-2">
          <h2 className="text-lg font-semibold text-white">Booking trend</h2>
          <div className="mt-6">
            <BookingTrendChart data={analytics.bookingTrend} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Booking status</h2>
          <div className="mt-6">
            <StatusBreakdown counts={analytics.statusCounts} />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 text-sm">
            <div>
              <p className="text-slate-300">Guest bookings</p>
              <p className="mt-1 text-2xl font-bold text-white">{analytics.guestBookingCount}</p>
            </div>
            <div>
              <p className="text-slate-300">Registered users</p>
              <p className="mt-1 text-2xl font-bold text-white">{analytics.registeredBookingCount}</p>
            </div>
            <div>
              <p className="text-slate-300">Activities</p>
              <p className="mt-1 text-2xl font-bold text-white">{analytics.activityCount}</p>
            </div>
            <div>
              <p className="text-slate-300">Customers</p>
              <p className="mt-1 text-2xl font-bold text-white">{analytics.userCount}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Top activities</h2>
          <div className="mt-6">
            <TopActivitiesTable activities={analytics.topActivities} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Recent bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-emerald-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6 overflow-x-auto">
            {analytics.recentBookings.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-300">
                    <th className="pb-3 pr-4 font-medium">Customer</th>
                    <th className="pb-3 pr-4 font-medium">Activity</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-800/80 last:border-0">
                      <td className="py-3 pr-4 text-slate-200">
                        {booking.user?.name ??
                          booking.guestName ??
                          booking.user?.email ??
                          booking.guestEmail}
                      </td>
                      <td className="py-3 pr-4 text-white">{booking.activity.title}</td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            booking.status === "CONFIRMED"
                              ? "success"
                              : booking.status === "CANCELLED"
                                ? "outline"
                                : "warning"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-emerald-300">
                        {formatPrice(Number(booking.totalPrice))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-400">No bookings yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
