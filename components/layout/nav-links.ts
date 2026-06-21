export const publicNavLinks = [
  { href: "/", labelKey: "home" },
  { href: "/activities", labelKey: "activities" },
  { href: "/about", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
] as const;

export const footerLinks = [
  ...publicNavLinks,
  { href: "/booking/lookup", labelKey: "findBooking" },
  { href: "/terms", labelKey: "terms" },
  { href: "/privacy", labelKey: "privacy" },
] as const;

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}
