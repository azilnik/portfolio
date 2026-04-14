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
  { label: "Work", href: "/#work" },
  { label: "About", href: "/about" },
  // "Get in touch" lives in the hero and footer, not the nav — keeps the
  // nav clean like the competitive set (Ainara: Work + Mentorship, Tyler:
  // Work + About, Danny: Home + Playground + Journal).
  { label: "LinkedIn", href: "https://www.linkedin.com/in/azilnik/", external: true },
  { label: "GitHub", href: "https://github.com/azilnik", external: true },
];
