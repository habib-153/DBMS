/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  MessageSquareQuote,
  Contact,
  ContactRound,
  Menu,
  LogOut,
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
  {
    label: "About",
    href: "/about",
    icon: <ContactRound size={18} />,
  },
  {
    label: "Contact",
    href: "/contact",
    icon: <Contact size={18} />,
  },
];

const Sidebar = ({ specificLinks, title }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { setUser, setIsLoading: userLoading } = useUser();
  const toggleSidebar = () => setIsOpen(!isOpen);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    //setUser(null);
    userLoading(true);

    if (protectedRoutes.some((route) => pathname.match(route))) {
      router.push("/");
    }
    toast.success("Logged out successfully");
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

  return (
    <>
      <div className="relative">
        <Button
          className="absolute top-0 left-0 z-10 lg:hidden p-2 m-2 light:text-gray-600 light:hover:text-gray-800"
          onClick={toggleSidebar}
        >
          <Menu size={28} />
        </Button>

        {/* Sidebar Drawer */}
        <div
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full w-52 md:w-72 light:bg-gray-200 dark:bg-gray-900 z-50 transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 lg:translate-x-0 lg:relative lg:flex p-4 flex flex-col`}
        >
          <div className="w-full space-y-3 flex-grow">
            <Link href={"/"}>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold light:text-gray-600 light:hover:bg-gray-100 rounded-lg px-3 py-2">
                  Warden
                </h2>
              </div>
            </Link>
            <Divider />
            <div>
              <nav className="space-y-1">
                {specificLinks.map((link) => (
                  <Link
                    key={link.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 light:text-gray-600 light:hover:bg-gray-100"
                    href={link.href}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <Divider />
            <div>
              <nav className="space-y-1">
                {commonLinks.map((link) => (
                  <Link
                    key={link.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 light:text-gray-600 light:hover:bg-gray-100"
                    href={link.href}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <Divider className="" />
            <div className="cursor-pointer">
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 light:text-gray-600 light:hover:bg-gray-100"
                onClick={handleLogout}
              >
                <LogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
