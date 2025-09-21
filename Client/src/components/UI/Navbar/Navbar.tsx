"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Link } from "@nextui-org/link";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";
import Image from "next/image";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

import { ThemeSwitch } from "../theme-switch";

import NavbarDropdown from "./NavbarDropdown";

import { siteConfig } from "@/src/config/site";
import Logo from "@/src/assets/logo.png";
import { useUser } from "@/src/context/user.provider";

export const Navbar = () => {
  const { user } = useUser();
  const router = useRouter();
  // 009688

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 flex sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href="/">
            <Image
              alt="Logo"
              className="rounded-2xl"
              height={50}
              src={Logo}
              width={50}
            />
            <p className="font-bold text-2xl text-inherit">Warden</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="flex gap-2">
          <ThemeSwitch className="hidden sm:block" />
        </NavbarItem>
        {user?.email ? (
          <NavbarItem className="flex gap-2">
            <NavbarDropdown user={user} />
          </NavbarItem>
        ) : (
          <NavbarItem className="flex gap-2">
            <Button
              className="relative text-[#009688] font-semibold bg-white border-[#009688] border-2 hover:text-white overflow-hidden transition-colors duration-300 ease-in-out group"
              onClick={() => router.push("/login")}
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-[#009688] -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out" />
            </Button>
          </NavbarItem>
        )}
        <NavbarMenuToggle className="lg:hidden" />
      </NavbarContent>
      <NavbarMenu>
        <div className="mx-4 mt-2 flex text-black flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={index === 2 ? "primary" : "foreground"}
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
