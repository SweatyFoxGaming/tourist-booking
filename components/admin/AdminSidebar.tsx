"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  BookOpen,
  Star,
  Palette,
  ExternalLink,
  BarChart3,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Analytics", icon: BarChart3, exact: true },
  { href: "/admin/activities", label: "Activities", icon: Map },
  { href: "/admin/wholesalers", label: "Wholesalers", icon: Building2 },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/theme", label: "Theme", icon: Palette },
];

export function AdminSidebar({
  email,
  whatsAppConfigured,
}: {
  email?: string | null;
  whatsAppConfigured: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-100">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <LayoutDashboard className="h-5 w-5 text-emerald-400" />
        <Link href="/admin" className="text-lg font-semibold tracking-tight">
          Tourist Admin
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-500/15 text-emerald-200"
                  : "text-slate-200 hover:bg-slate-900 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <div className="my-4 border-t border-slate-800" />

        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          View Site
        </Link>
      </nav>

      <div className="space-y-3 border-t border-slate-800 p-4 text-xs">
        <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2">
          <span className="text-slate-300">WhatsApp API</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-medium",
              whatsAppConfigured
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-amber-500/20 text-amber-300"
            )}
          >
            {whatsAppConfigured ? "Live" : "Off"}
          </span>
        </div>
        {email && <p className="truncate text-slate-400">{email}</p>}
      </div>
    </aside>
  );
}
