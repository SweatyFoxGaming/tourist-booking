import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  LayoutDashboard,
  Map,
  Calendar,
  BookOpen,
  Star,
  Palette,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/activities", label: "Activities", icon: Map },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/theme", label: "Theme Builder", icon: Palette },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="text-lg font-bold text-[var(--color-primary)]">
            Admin Panel
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)]"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100"
          >
            <ExternalLink className="h-4 w-4" />
            View Site
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 border-t p-4 text-sm text-gray-500">
          {session?.user?.email}
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex h-16 items-center border-b bg-white px-6 lg:hidden">
          <Link href="/admin" className="font-bold text-[var(--color-primary)]">
            Admin
          </Link>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
