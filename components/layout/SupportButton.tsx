"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  X,
  Mail,
  MessageCircle,
  Search,
  MessageSquare,
  Bot,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { getWhatsAppChatUrl } from "@/lib/whatsapp-public";
import { SupportChat } from "@/components/layout/SupportChat";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "support@touristbooking.com";

type SupportTab = "ai" | "help";

export function SupportButton() {
  const t = useTranslations("support");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<SupportTab>("ai");
  const panelRef = useRef<HTMLDivElement>(null);
  const whatsAppUrl = getWhatsAppChatUrl(
    "Hi! I need help with Tourist Booking."
  );

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const items = [
    {
      key: "contact",
      href: "/contact",
      icon: MessageSquare,
      label: t("contact"),
      description: t("contactHint"),
      external: false,
    },
    {
      key: "lookup",
      href: "/booking/lookup",
      icon: Search,
      label: t("findBooking"),
      description: t("findBookingHint"),
      external: false,
    },
    ...(whatsAppUrl
      ? [
          {
            key: "whatsapp",
            href: whatsAppUrl,
            icon: MessageCircle,
            label: t("whatsapp"),
            description: t("whatsappHint"),
            external: true,
          },
        ]
      : []),
    {
      key: "email",
      href: `mailto:${SUPPORT_EMAIL}`,
      icon: Mail,
      label: t("email"),
      description: t("emailHint"),
      external: true,
    },
  ];

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50">
      {open && (
        <div
          className="mb-3 w-80 overflow-hidden rounded-[var(--radius)] border border-gray-200 bg-white shadow-xl sm:w-96"
          role="dialog"
          aria-label={t("title")}
        >
          <div className="border-b border-gray-100 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent px-4 py-3">
            <p className="font-semibold text-[var(--color-text)]">{t("title")}</p>
            <p className="text-xs text-gray-500">{t("subtitle")}</p>
            <div className="mt-3 flex gap-1 rounded-[calc(var(--radius)-2px)] bg-white/80 p-1">
              <button
                type="button"
                onClick={() => setTab("ai")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-[calc(var(--radius)-4px)] px-2 py-1.5 text-xs font-medium transition-colors",
                  tab === "ai"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Bot className="h-3.5 w-3.5" />
                {t("tabAi")}
              </button>
              <button
                type="button"
                onClick={() => setTab("help")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-[calc(var(--radius)-4px)] px-2 py-1.5 text-xs font-medium transition-colors",
                  tab === "help"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <LifeBuoy className="h-3.5 w-3.5" />
                {t("tabHelp")}
              </button>
            </div>
          </div>

          {tab === "ai" ? (
            <SupportChat />
          ) : (
            <ul className="max-h-80 overflow-y-auto p-2">
              {items.map((item) => {
                const Icon = item.icon;
                const className = cn(
                  "flex w-full items-start gap-3 rounded-[calc(var(--radius)-2px)] px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                );

                const content = (
                  <>
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-[var(--color-text)]">
                        {item.label}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {item.description}
                      </span>
                    </span>
                  </>
                );

                return (
                  <li key={item.key}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target={
                          item.href.startsWith("mailto:") ? undefined : "_blank"
                        }
                        rel={
                          item.href.startsWith("mailto:")
                            ? undefined
                            : "noopener noreferrer"
                        }
                        className={className}
                        onClick={() => setOpen(false)}
                      >
                        {content}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className={className}
                        onClick={() => setOpen(false)}
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
          open ? "bg-[var(--color-secondary)]" : "bg-[var(--color-primary)]"
        )}
        aria-expanded={open}
        aria-label={open ? t("close") : t("open")}
      >
        {open ? <X className="h-6 w-6" /> : <LifeBuoy className="h-6 w-6" />}
      </button>
    </div>
  );
}
