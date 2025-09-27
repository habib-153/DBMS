"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import NextLink from "next/link";
import clsx from "clsx";
import Image from "next/image";
import { Button } from "@heroui/button";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { ThemeSwitch } from "../theme-switch";

import NavbarDropdown from "./NavbarDropdown";

import { siteConfig } from "@/src/config/site";
import Logo_light from "@/src/assets/logo_light.png";
import Logo_dark from "@/src/assets/logo_dark.png";
import { useUser } from "@/src/context/user.provider";

export const Navbar = () => {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
  
    // Ensure component is mounted before accessing theme
    useEffect(() => {
      setMounted(true);
    }, []);

    const currentTheme = mounted ? theme : "light";
  const Logo = currentTheme === "dark" ? Logo_dark : Logo_light;

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <NextUINavbar className="border-b border-gray-200 dark:border-gray-700" maxWidth="xl" position="sticky">
      {/* Left: Logo */}
      <NavbarContent className="basis-1/5 sm:basis-1/4" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href="/">
            <Image
              alt="Logo"
              className="rounded-2xl"
              height={45}
              src={Logo}
              width={45}
            />
            <p className="font-bold text-xl text-brand-primary">Warden</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* Center: Navigation Items */}
      <NavbarContent className="hidden lg:flex basis-1/2" justify="center">
        <div className="flex gap-8">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  "relative px-4 py-2 rounded-full font-medium transition-all duration-300 hover:text-brand-primary",
                  isActiveLink(item.href)
                    ? "text-brand-primary bg-brand-primary/10 shadow-sm border border-brand-primary/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                href={item.href}
              >
                {item.label}
                {isActiveLink(item.href) && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-brand-primary rounded-full" />
                )}
              </NextLink>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* Right: Theme Switch & User Actions */}
      <NavbarContent className="basis-1/5 sm:basis-1/4" justify="end">
        <NavbarItem className="flex gap-3">
          <ThemeSwitch className="hidden sm:block" />
        </NavbarItem>
        {user?.email ? (
          <NavbarItem className="flex gap-2">
            <NavbarDropdown user={user} />
          </NavbarItem>
        ) : (
          <NavbarItem className="flex gap-2">
            <Button
              className="relative text-white font-semibold bg-brand-primary hover:bg-brand-primary/90 border border-brand-primary hover:border-brand-primary/90 overflow-hidden transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
              size="sm"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          </NavbarItem>
        )}
        <NavbarMenuToggle className="lg:hidden" />
      </NavbarContent>
      <NavbarMenu>
        <div className="mx-4 mt-6 flex flex-col gap-4">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <NextLink
                className={clsx(
                  "block px-4 py-3 rounded-lg font-medium transition-all duration-300",
                  isActiveLink(item.href)
                    ? "text-brand-primary bg-brand-primary/10 border border-brand-primary/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
          
          {/* Mobile Theme Switch */}
          <NavbarMenuItem>
            <div className="px-4 py-3">
              <ThemeSwitch />
            </div>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
