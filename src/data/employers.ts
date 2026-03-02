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
    tagline:
      "Empowering construction teams to make smarter decisions.",
    description:
      "Join is a project management platform for construction companies, owners, and architects to collaborate and bring building plans to life. I lead the team building the industry's first user-centered PM and decision-making platform — directly impacting business cases, timelines, and budgets.",
    metrics: [
      { label: "Growth", value: "66% reduction in support tickets" },
      {
        label: "Product",
        value: "50% reduction in customer decision-making time",
      },
      {
        label: "People & Process",
        value:
          "Develop, manage, and mentor a talented team of product and marketing designers",
      },
    ],
  },
  {
    id: "blockdaemon",
    company: "Blockdaemon",
    dateRange: "2021 — 2023",
    role: "Director of Design",
    tagline:
      "Humanizing blockchain technology with an easy-to-use wallet and developer tools.",
    description:
      "Blockdaemon is a blockchain infrastructure platform empowering enterprises like Goldman Sachs and Microsoft to build Web3 applications. I joined as the first designer — through the acquisition of my consultancy, Gravy — and built the design function from the ground up.",
    metrics: [
      {
        label: "Growth",
        value: "64% increase in click-through rates through overhaul of website",
      },
      {
        label: "Product",
        value: "23x increase in usage of Blockdaemon's flagship API product",
      },
      {
        label: "People & Process",
        value:
          "Scaled team to 10 product designers, marketing designers, and researchers",
      },
    ],
  },
  {
    id: "gradle",
    company: "Gradle",
    dateRange: "2019 — 2021",
    role: "Director of Design",
    tagline: "Enabling developers to build better software — faster.",
    description:
      "Gradle streamlines development workflows for teams at Netflix, Salesforce, and Microsoft — helping developers find and fix issues faster. I led product design and established the user research practice.",
    metrics: [
      {
        label: "Growth",
        value: "Supported leadership with Series C funding of $27MM",
      },
      {
        label: "Product",
        value: "95% reduction in test times, and 86% reduction in build times",
      },
      {
        label: "People & Process",
        value: "Led product design efforts, and built out user research practice",
      },
    ],
  },
];
