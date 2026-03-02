/**
 * Employer data — used on the homepage "My Work" section.
 *
 * Each employer block shows the company name, date range, role, and a
 * brief description, along with key metrics. This is structural data,
 * not authored content, so it lives here instead of in a content collection.
 */

export interface EmployerMetric {
  label: string;
  value: string;
}

export interface Employer {
  /** Internal ID — matches the `employer` field in case study frontmatter. */
  id: "join" | "blockdaemon" | "gradle" | "freelance";
  company: string;
  dateRange: string;
  role: string;
  tagline: string;
  description: string;
  metrics: EmployerMetric[];
}

export const employers: Employer[] = [
  {
    id: "join",
    company: "Join",
    dateRange: "2023 — Present",
    role: "Head of Design",
    tagline: "Redefining how teams hire together",
    description:
      "Leading design for Join's collaborative hiring platform. Responsible for product design, design systems, and growing the design team. Shipped a complete navigation redesign, new onboarding flows, and a candidate evaluation framework.",
    metrics: [
      { label: "Growth", value: "3x" },
      { label: "Product", value: "12 shipped" },
      { label: "People & Process", value: "4 → 8 team" },
    ],
  },
  {
    id: "blockdaemon",
    company: "Blockdaemon",
    dateRange: "2021 — 2023",
    role: "Senior Product Designer",
    tagline: "Making blockchain infrastructure accessible",
    description:
      "Designed the node management platform and marketplace for the leading blockchain infrastructure provider. Led the end-to-end redesign of the checkout flow, reducing drop-off by 40%.",
    metrics: [
      { label: "Growth", value: "40% ↓ drop-off" },
      { label: "Product", value: "8 shipped" },
      { label: "People & Process", value: "Design system v2" },
    ],
  },
  {
    id: "gradle",
    company: "Gradle",
    dateRange: "2019 — 2021",
    role: "Product Designer",
    tagline: "Accelerating software builds for developers",
    description:
      "Designed developer tools for the Gradle Build Tool ecosystem, including build scan analytics, performance dashboards, and onboarding experiences that helped drive a 2x increase in enterprise adoption.",
    metrics: [
      { label: "Growth", value: "2x adoption" },
      { label: "Product", value: "6 shipped" },
      { label: "People & Process", value: "Research ops" },
    ],
  },
];
