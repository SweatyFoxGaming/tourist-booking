"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { publicNavLinks, isNavActive } from "@/components/layout/nav-links";
import { useTranslations } from "@/lib/i18n/client";

export function PublicNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-6 md:flex">
        {publicNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-[var(--color-primary)]",
              isNavActive(pathname, link.href)
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text)]"
            )}
          >
            {t(link.labelKey)}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="rounded-[var(--radius)] p-2 text-[var(--color-text)] md:hidden"
        onClick={() => setOpen(!open)}
        aria-label={open ? t("closeMenu") : t("openMenu")}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-gray-200 bg-white px-4 py-4 shadow-md md:hidden">
          <nav className="flex flex-col gap-3">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-[var(--radius)] px-3 py-2 text-sm font-medium",
                  isNavActive(pathname, link.href)
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "text-[var(--color-text)] hover:bg-gray-50"
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
