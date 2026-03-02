/**
 * Site-wide navigation links.
 *
 * Used by both the desktop nav bar and the mobile slide-over menu.
 * Each link has a `label` (visible text), `href` (URL or anchor),
 * and an optional `external` flag for links that open in a new tab.
 */

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export const navLinks: NavLink[] = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  // Resume link — update the href once you have a PDF or external URL.
  { label: "Resume", href: "#" },
  // Opens the user's email client.
  { label: "Get in touch", href: "mailto:ari@ari.design", external: true },
];
