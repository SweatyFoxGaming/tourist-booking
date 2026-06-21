import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Map, BookOpen, Users } from "lucide-react";

export default async function AdminDashboard() {
  const [activityCount, bookingCount, userCount, recentBookings, revenue] =
    await Promise.all([
      prisma.activity.count(),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          activity: { select: { title: true } },
        },
      }),
      prisma.booking.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { totalPrice: true },
      }),
    ]);

  const totalRevenue = Number(revenue._sum.totalPrice ?? 0);

  const stats = [
    { label: "Activities", value: activityCount, icon: Map },
    { label: "Confirmed Bookings", value: bookingCount, icon: BookOpen },
    { label: "Customers", value: userCount, icon: Users },
    { label: "Revenue", value: formatPrice(totalRevenue), icon: DollarSign },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-500">Overview of your booking platform</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-[var(--radius)] bg-[var(--color-primary)]/10 p-3">
                <stat.icon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 pr-4">Customer</th>
                    <th className="pb-3 pr-4">Activity</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        {booking.user?.name ??
                          booking.guestName ??
                          booking.user?.email ??
                          booking.guestEmail}
                      </td>
                      <td className="py-3 pr-4">{booking.activity.title}</td>
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
                      <td className="py-3">{formatPrice(Number(booking.totalPrice))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No bookings yet.</p>
          )}
          <Link
            href="/admin/bookings"
            className="mt-4 inline-block text-sm text-[var(--color-primary)] hover:underline"
          >
            View all bookings →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
