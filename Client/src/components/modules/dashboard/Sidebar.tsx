"use client";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  MessageSquareQuote,
  Menu,
  LogOut,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { logout } from "@/src/services/AuthService";
import { protectedRoutes } from "@/src/constant";
import { useUser } from "@/src/context/user.provider";

interface ISidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}
interface SidebarProps {
  specificLinks: ISidebarLink[];
  title: string;
}

const commonLinks = [
  {
    label: "NewsFeed",
    href: "/posts",
    icon: <MessageSquareQuote size={18} />,
  },
];

const Sidebar = ({ specificLinks, title }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { setIsLoading: userLoading } = useUser();
  const toggleSidebar = () => setIsOpen(!isOpen);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      userLoading(true);
      // wait for server-side logout to mark session inactive
      await logout();

      // Import clearTokens dynamically to avoid SSR issues
      const { clearTokens } = await import("@/src/utils/tokenStorage");

      clearTokens(); // Clear client-side tokens

      if (protectedRoutes.some((route) => pathname.match(route))) {
        router.push("/");
      }
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout failed", err);
      // still navigate away to clear client state
      if (protectedRoutes.some((route) => pathname.match(route))) {
        router.push("/");
      }
      toast.error("Logout encountered an issue");
    } finally {
      userLoading(false);
    }
  };

  const handleClick = (event: MouseEvent) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen]);

  const isLinkActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        isIconOnly
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#a50034] text-white"
        onClick={toggleSidebar}
      >
        <Menu size={24} />
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(false);
            }
          }}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r-2 border-gray-200 dark:border-gray-700 z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative flex flex-col`}
      >
        {/* Close button for mobile */}
        <Button
          isIconOnly
          className="absolute top-4 right-4 lg:hidden"
          variant="light"
          onClick={() => setIsOpen(false)}
        >
          <X size={20} />
        </Button>

        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          {/* Logo/Title */}
          <Link href="/" onClick={() => setIsOpen(false)}>
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#a50034] to-pink-600 bg-clip-text text-transparent">
                {title || "Warden"}
              </h2>
            </div>
          </Link>

          <Divider />

          {/* Specific Links (Dashboard Links) */}
          <div className="">
            <nav className="space-y-1">
              {specificLinks.map((link) => (
                <Link
                  key={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                    isLinkActive(link.href)
                      ? "bg-[#a50034] text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <Divider className="mt-3" />

          {/* Common Links */}
          <div className="">
            <nav className="space-y-1">
              {commonLinks.map((link) => (
                <Link
                  key={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                    isLinkActive(link.href)
                      ? "bg-[#a50034] text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <Divider className="mt-3" />

          {/* Logout Button */}
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-all font-medium"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
