"use client";

import { Button } from "@heroui/button";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

import FXForm from "@/src/components/form/FXForm";
import FXInput from "@/src/components/form/FXInput";
import loginValidationSchema from "@/src/schema/loginSchema";
import { useUser } from "@/src/context/user.provider";
import { useUserLogin } from "@/src/hooks/auth.hook";
import registerBg from "@/src/assets/register_bg.png";
import registerBg2 from "@/src/assets/registerBg2.jpg";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { setIsLoading: userLoading } = useUser();

  const redirect = searchParams.get("redirect");

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const { mutate: handleUserLogin, isPending, isSuccess } = useUserLogin();

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    handleUserLogin(data);
    userLoading(true);
  };

  useEffect(() => {
    if (!isPending && isSuccess) {
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/");
      }
    }
  }, [isPending, isSuccess]);

  // Select the appropriate background image based on theme
  const currentTheme = mounted ? theme : "light";
  const backgroundImage = currentTheme === "dark" ? registerBg : registerBg2;

  return (
    <div className="min-h-[calc(100vh-100px)] relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          fill
          priority
          alt="Login background"
          className="object-cover"
          quality={85}
          src={backgroundImage}
        />
      </div>

      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-black/0 to-black/5" />

      {/* Main Content Container */}
      <div className="relative z-10 min-h-[calc(100vh-100px)] flex items-center">
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <div className="w-full mx-auto">
            {/* Left Side - Form */}
            <div className="w-full max-w-lg mx-auto">
              {/* Header */}
              <div className="text-center mb-3">
                <h1 className="text-3xl lg:text-5xl font-bold mb-2 leading-tight drop-shadow-lg">
                  <span className="text-inherit">Welcome</span>{" "}
                  <span className="text-brand-contrast">back</span>
                  <span className="text-inherit">.</span>
                </h1>
                <p className="text-inherit/90 text-lg lg:text-xl drop-shadow-md">
                  Sign in to{" "}
                  <span className="text-brand-contrast font-semibold">
                    WARDEN
                  </span>{" "}
                  <span className="text-inherit/90">
                    - Secure Crime Reporting Platform
                  </span>
                </p>
              </div>

              {/* Form Card with Enhanced Glass Effect */}
              <div className="glass-form-enhanced rounded-3xl p-4 lg:p-5">
                <FXForm
                  resolver={zodResolver(loginValidationSchema)}
                  onSubmit={onSubmit}
                >
                  <div className="space-y-4">
                    <div>
                      <FXInput
                        isRequired
                        label="Email Address"
                        name="email"
                        placeholder="Enter your email address"
                        size="sm"
                        type="email"
                      />
                    </div>
                    <div>
                      <FXInput
                        isRequired
                        label="Password"
                        name="password"
                        placeholder="Enter your password"
                        size="sm"
                        type="password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-3">
                    <Link
                      className="text-sm text-inherit/80 hover:text-brand-contrast transition-colors duration-200 underline drop-shadow-sm"
                      href="/forgot-password"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="mt-6">
                    <Button
                      className="w-full h-12 text-lg font-semibold bg-brand-primary hover:bg-brand-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      isLoading={isPending}
                      type="submit"
                    >
                      {isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                </FXForm>

                <div className="text-center mt-4">
                  <p className="text-inherit/80 drop-shadow-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                      className="font-semibold text-brand-contrast hover:text-brand-primary transition-colors duration-200 underline drop-shadow-sm"
                      href="/register"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
