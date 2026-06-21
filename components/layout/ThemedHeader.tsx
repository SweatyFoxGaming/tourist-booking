import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import type { SiteTheme } from "@prisma/client";
import { MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/layout/PublicNav";
import { footerLinks } from "@/components/layout/nav-links";

export function ThemedHeader({ theme }: { theme: SiteTheme }) {
  const headerClass =
    theme.headerStyle === "transparent"
      ? "bg-transparent absolute top-0 left-0 right-0 z-50"
      : "bg-white/95 backdrop-blur border-b border-gray-200 sticky top-0 z-50";

  return (
    <header className={`${headerClass} relative`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          {theme.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={theme.logoUrl} alt="Logo" className="h-10 w-auto" />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] text-white font-bold"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              TB
            </div>
          )}
          <span className="text-xl font-bold text-[var(--color-text)]">
            Tourist Booking
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <PublicNav />
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}

async function HeaderAuth() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="hidden items-center gap-3 sm:flex">
        {session.user.role === "ADMIN" && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">Admin</Link>
          </Button>
        )}
        {session.user.role !== "ADMIN" && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/my-bookings">My Bookings</Link>
          </Button>
        )}
        <span className="hidden text-sm text-gray-600 lg:inline">
          {session.user.name ?? session.user.email}
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="hidden sm:block">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
    </div>
  );
}

export function ThemedFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="font-semibold text-[var(--color-text)]">
              Tourist Booking
            </h3>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Discover and book unique tourist activities around the world.
              No account required — pick an experience, choose your date, and go.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-text)]">Pages</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-500">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[var(--color-primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-text)]">Contact</h4>
            <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4 shrink-0" />
              Available worldwide
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-4 w-4 shrink-0" />
              support@touristbooking.com
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-gray-100 pt-8 text-sm text-gray-400 sm:flex-row">
          <span>© {new Date().getFullYear()} Tourist Booking. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-[var(--color-primary)]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[var(--color-primary)]">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
