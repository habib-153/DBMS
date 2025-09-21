import type { Metadata } from "next";

import {
  BookOpenText,
} from "lucide-react";

import Sidebar from "@/src/components/modules/dashboard/Sidebar";

export const metadata: Metadata = {
  title: "User Dashboard",
  description:
    "Discover, share, and explore travel stories, tips, and guides from a community of travel enthusiasts. Plan your next adventure with expert advice and unique insights into destinations around the world.",
};

export default function UserDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userLinks = [
    {
      label: "Dashboard",
      href: "/user-dashboard",
      icon: <BookOpenText size={20} />,
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar specificLinks={userLinks} title="User Panel"/>
      <main className="flex-1 p-2 md:p-6">{children}</main>
    </div>
  );
}