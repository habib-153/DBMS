"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProviderProps } from "next-themes/dist/types";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import UserProvider from "@/src/context/user.provider";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

const queryClient = new QueryClient();

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <HeroUIProvider navigate={router.push}>
          <Toaster richColors position="top-center"/>
          <NextThemesProvider {...themeProps}>
            {children}
          </NextThemesProvider>
        </HeroUIProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}