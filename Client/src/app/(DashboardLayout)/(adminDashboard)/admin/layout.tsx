import type { Metadata } from "next";
import { Home, FileText, Users, LocateIcon } from "lucide-react";

import Sidebar from "@/src/components/modules/dashboard/Sidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard - Warden",
  description: "Manage users, posts, and view platform statistics",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminLinks = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <Home size={18} />,
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: <Users size={18} />,
    },
    {
      label: "Post Management",
      href: "/admin/posts",
      icon: <FileText size={18} />,
    },
    {
      label: "Report Management",
      href: "/admin/reports",
      icon: <FileText size={18} />,
    },
    {
      label: "Track Location",
      href: "/admin/location-tracking",
      icon: <LocateIcon size={18} />,
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="">
        <Sidebar specificLinks={adminLinks} title="Admin Panel" />
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4">{children}</div>
      </main>
    </div>
  );
}
