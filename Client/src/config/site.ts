export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Warden || Crime Reporting and Community Verification Platform",
  description:
    "🚀 Your ultimate platform for sharing travel stories, discovering destinations, and connecting with fellow adventurers!",
  navItems: [
    {
      label: "NewsFeed",
      href: "/",
    },
    {
      label: "Heatmap",
      href: "/heatmap",
    },
    {
      label: "Contact",
      href: "/contact",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "NewsFeed",
      href: "/posts",
    },
    {
      label: "Heatmap",
      href: "/heatmap",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ],
};
