import { formatPrice } from "@/lib/utils";

export function AdminStatCard({
  label,
  value,
  hint,
  accent = "emerald",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "emerald" | "blue" | "amber" | "rose";
}) {
  const accentClasses = {
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-300",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-300",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-300",
  }[accent];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
      {hint && (
        <p className={`mt-3 inline-flex rounded-full bg-gradient-to-r px-2.5 py-1 text-xs ${accentClasses}`}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function BookingTrendChart({
  data,
}: {
  data: { date: string; bookings: number; revenue: number }[];
}) {
  const maxBookings = Math.max(...data.map((d) => d.bookings), 1);

  return (
    <div className="space-y-4">
      <div className="flex h-48 items-end gap-2">
        {data.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end justify-center">
              <div
                className="w-full max-w-8 rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all"
                style={{ height: `${(day.bookings / maxBookings) * 100}%`, minHeight: day.bookings ? 8 : 2 }}
                title={`${day.bookings} bookings · ${formatPrice(day.revenue)}`}
              />
            </div>
            <span className="text-[10px] text-slate-400">{day.date.split(" ")[0]}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">Daily bookings over the last 14 days</p>
    </div>
  );
}

export function StatusBreakdown({
  counts,
}: {
  counts: { PENDING: number; CONFIRMED: number; CANCELLED: number };
}) {
  const total = counts.PENDING + counts.CONFIRMED + counts.CANCELLED || 1;
  const items = [
    { label: "Confirmed", value: counts.CONFIRMED, color: "bg-emerald-500" },
    { label: "Pending", value: counts.PENDING, color: "bg-amber-500" },
    { label: "Cancelled", value: counts.CANCELLED, color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-800">
        {items.map((item) => (
          <div
            key={item.label}
            className={item.color}
            style={{ width: `${(item.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
            <span className="text-slate-300">{item.label}</span>
            <span className="ml-auto font-semibold text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopActivitiesTable({
  activities,
}: {
  activities: { title: string; bookings: number; revenue: number }[];
}) {
  if (activities.length === 0) {
    return <p className="text-sm text-slate-400">No confirmed bookings yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-left text-slate-300">
            <th className="pb-3 pr-4 font-medium">Activity</th>
            <th className="pb-3 pr-4 font-medium">Bookings</th>
            <th className="pb-3 font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.title} className="border-b border-slate-800/80 last:border-0">
              <td className="py-3 pr-4 text-white">{activity.title}</td>
              <td className="py-3 pr-4 text-slate-200">{activity.bookings}</td>
              <td className="py-3 font-medium text-emerald-300">{formatPrice(activity.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
