/**
 * Site-wide navigation links.
 *
 * Reduced to three. LinkedIn and GitHub are findable — this is about reduction.
 */

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export const navLinks: NavLink[] = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/about" },
  { label: "Email", href: "mailto:ari@zilnik.com" },
];
