"use client";

import { FieldValues, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

import {
  MotionDiv,
  MotionH1,
  MotionP,
  MotionSpan,
} from "@/src/components/motion-components";
import FXForm from "@/src/components/form/FXForm";
import FXInput from "@/src/components/form/FXInput";
import registerValidationSchema from "@/src/schema/registerSchema";
import { useUserRegistration } from "@/src/hooks/auth.hook";
import VerifyOtpModal from "@/src/components/UI/modal/AuthModal/VerifyOtpModal";
import { useUser } from "@/src/context/user.provider";
import registerBg from "@/src/assets/register_bg.png";
import registerBg2 from "@/src/assets/registerBg2.jpg";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { setIsLoading: userRegLoading } = useUser();

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);
  const { mutateAsync: registerAsync, isPending } = useUserRegistration();

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const userData = {
      ...data,
      profilePhoto:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    };

    try {
      userRegLoading(true);

      const res = await registerAsync(userData);

      // axios service returns object { success, message, data }
      // data may contain user under res.data.user or res.user depending on service wrapper
      const maybeUser = (res as any)?.data?.user || (res as any)?.user;
      const email = maybeUser?.email || (userData as any).email;

      setRegisteredEmail(email);
      setShowVerifyModal(true);
    } catch (err) {
      // error shown by hook
    } finally {
      userRegLoading(false);
    }
  };

  // Removed automatic redirect on registration success so the verification
  // modal can be shown and the user can verify their email first.

  // Select the appropriate background image based on theme
  const currentTheme = mounted ? theme : "light";
  const backgroundImage = currentTheme === "dark" ? registerBg : registerBg2;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  return (
    <MotionDiv
      animate="visible"
      className="min-h-[calc(100vh-100px)] relative overflow-hidden"
      initial="hidden"
      variants={containerVariants}
    >
      {/* Background Image */}
      <MotionDiv
        animate={{ scale: 1, opacity: 1 }}
        className="absolute inset-0"
        initial={{ scale: 1.1, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Image
          fill
          priority
          alt="Register background"
          className="object-cover"
          quality={85}
          src={backgroundImage}
        />
      </MotionDiv>

      {/* Gradient overlay for better contrast */}
      {currentTheme === "light" ? (
        <MotionDiv
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/5 to-black/10"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
      ) : null}

      {/* Main Content Container */}
      <div className="relative z-10 min-h-[calc(100vh-100px)] flex items-center">
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <div className="w-full mx-auto">
            {/* Left Side - Form */}
            <div className="w-full max-w-lg mx-auto">
              {/* Header */}
              <MotionDiv className="text-center mb-3" variants={itemVariants}>
                <MotionH1
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl lg:text-5xl font-bold mb-2 leading-tight drop-shadow-lg"
                  initial={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <span className="text-inherit">Create new</span>{" "}
                  <MotionSpan
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-brand-contrast"
                    initial={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    account
                  </MotionSpan>
                  <span className="text-inherit">.</span>
                </MotionH1>
                <MotionP
                  animate={{ opacity: 1 }}
                  className="text-inherit/90 drop-shadow-md"
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  Join{" "}
                  <span className="text-brand-contrast font-semibold">
                    WARDEN
                  </span>{" "}
                  <span className="text-inherit/90">
                    - Secure Crime Reporting Platform
                  </span>
                </MotionP>
              </MotionDiv>

              {/* Form Card with Enhanced Glass Effect */}
              <MotionDiv
                className="glass-form-enhanced rounded-3xl p-4 lg:p-5"
                transition={{ duration: 0.2 }}
                variants={formVariants}
                whileHover={{ scale: 1.02 }}
              >
                <FXForm
                  resolver={zodResolver(registerValidationSchema)}
                  onSubmit={onSubmit}
                >
                  <MotionDiv
                    className="space-y-3"
                    variants={containerVariants}
                  >
                    <MotionDiv variants={itemVariants}>
                      <FXInput
                        isRequired
                        label="Full Name"
                        name="name"
                        placeholder="Enter your full name"
                        size="sm"
                      />
                    </MotionDiv>
                    <MotionDiv variants={itemVariants}>
                      <FXInput
                        isRequired
                        label="Email Address"
                        name="email"
                        placeholder="Enter your email address"
                        size="sm"
                        type="email"
                      />
                    </MotionDiv>
                    <MotionDiv variants={itemVariants}>
                      <FXInput
                        isRequired
                        label="Mobile Number"
                        name="phone"
                        placeholder="Enter your mobile number"
                        size="sm"
                      />
                    </MotionDiv>
                    <MotionDiv variants={itemVariants}>
                      <FXInput
                        isRequired
                        label="Password"
                        name="password"
                        placeholder="Enter your password"
                        size="sm"
                        type="password"
                      />
                    </MotionDiv>
                  </MotionDiv>

                  <MotionDiv className="mt-6" variants={itemVariants}>
                    <MotionDiv
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full h-12  font-semibold bg-brand-primary hover:bg-brand-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        isLoading={isPending}
                        type="submit"
                      >
                        {isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </MotionDiv>
                  </MotionDiv>
                </FXForm>

                <MotionDiv
                  className="text-center text-sm mt-4"
                  variants={itemVariants}
                >
                  <p className="text-inherit/80 drop-shadow-sm">
                    Already have an account?{" "}
                    <Link
                      className="font-semibold text-brand-contrast hover:text-brand-primary transition-colors duration-200 underline drop-shadow-sm"
                      href="/login"
                    >
                      Sign in
                    </Link>
                  </p>
                </MotionDiv>
              </MotionDiv>
            </div>
          </div>
        </div>
      </div>
      <VerifyOtpModal
        email={registeredEmail || ""}
        open={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerified={() => {
          // after verify, redirect to home or login
          router.push(redirect || "/");
        }}
      />
    </MotionDiv>
  );
}
