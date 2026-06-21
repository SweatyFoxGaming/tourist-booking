import { prisma } from "@/lib/db";
import { subDays, startOfDay, format } from "date-fns";

export async function getAdminAnalytics() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = subDays(todayStart, 7);
  const trendStart = subDays(todayStart, 13);
  const monthStart = subDays(todayStart, 30);

  const [
    activityCount,
    userCount,
    reviewAgg,
    statusGroups,
    recentBookings,
    trendBookings,
    topActivities,
    guestBookingCount,
    registeredBookingCount,
    todayBookings,
    weekRevenue,
    monthRevenue,
    allConfirmedRevenue,
  ] = await Promise.all([
    prisma.activity.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        activity: { select: { title: true } },
      },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: trendStart } },
      select: {
        createdAt: true,
        totalPrice: true,
        status: true,
      },
    }),
    prisma.booking.groupBy({
      by: ["activityId"],
      where: { status: "CONFIRMED" },
      _count: { _all: true },
      _sum: { totalPrice: true },
    }),
    prisma.booking.count({
      where: { status: "CONFIRMED", user: { is: null } },
    }),
    prisma.booking.count({
      where: { status: "CONFIRMED", user: { isNot: null } },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", createdAt: { gte: weekStart } },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", createdAt: { gte: monthStart } },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
  ]);

  const topActivitiesSorted = [...topActivities]
    .sort((a, b) => Number(b._sum.totalPrice ?? 0) - Number(a._sum.totalPrice ?? 0))
    .slice(0, 5);

  const activityIds = topActivitiesSorted.map((row) => row.activityId);
  const activities =
    activityIds.length > 0
      ? await prisma.activity.findMany({
          where: { id: { in: activityIds } },
          select: { id: true, title: true },
        })
      : [];
  const activityTitleById = new Map(activities.map((a) => [a.id, a.title]));

  const statusCounts = {
    PENDING: 0,
    CONFIRMED: 0,
    CANCELLED: 0,
  };

  for (const group of statusGroups) {
    if (group.status in statusCounts) {
      statusCounts[group.status as keyof typeof statusCounts] = group._count._all;
    }
  }

  const trendDays = Array.from({ length: 14 }, (_, index) => {
    const day = subDays(todayStart, 13 - index);
    return {
      date: format(day, "MMM d"),
      key: format(day, "yyyy-MM-dd"),
      bookings: 0,
      revenue: 0,
    };
  });

  const trendMap = new Map(trendDays.map((day) => [day.key, day]));

  for (const booking of trendBookings) {
    const key = format(startOfDay(booking.createdAt), "yyyy-MM-dd");
    const day = trendMap.get(key);
    if (!day) {
      continue;
    }
    day.bookings += 1;
    if (booking.status === "CONFIRMED") {
      day.revenue += Number(booking.totalPrice);
    }
  }

  const confirmedCount = allConfirmedRevenue._count._all;
  const totalRevenue = Number(allConfirmedRevenue._sum.totalPrice ?? 0);
  const avgBookingValue = confirmedCount > 0 ? totalRevenue / confirmedCount : 0;

  return {
    activityCount,
    userCount,
    avgRating: reviewAgg._avg.rating ?? 0,
    reviewCount: reviewAgg._count,
    statusCounts,
    recentBookings,
    bookingTrend: trendDays,
    topActivities: topActivitiesSorted.map((row) => ({
      title: activityTitleById.get(row.activityId) ?? "Unknown",
      bookings: row._count._all,
      revenue: Number(row._sum.totalPrice ?? 0),
    })),
    guestBookingCount,
    registeredBookingCount,
    todayBookings,
    weekRevenue: Number(weekRevenue._sum.totalPrice ?? 0),
    weekBookingCount: weekRevenue._count._all,
    monthRevenue: Number(monthRevenue._sum.totalPrice ?? 0),
    monthBookingCount: monthRevenue._count._all,
    totalRevenue,
    confirmedCount,
    avgBookingValue,
  };
}
