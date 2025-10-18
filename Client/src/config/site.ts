export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Warden || Crime Reporting and Community Verification Platform",
  description:"" ,
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
      label: "Analytics",
      href: "/analytics",
    }
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
