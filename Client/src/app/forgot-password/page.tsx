"use client";
import { useState } from "react";
import { Input, Button, Link, Spinner } from "@heroui/react";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect } from "react";

import { forgotPassword } from "@/src/services/AuthService";
import registerBg from "@/src/assets/register_bg.png";
import registerBg2 from "@/src/assets/registerBg2.jpg";
import Logo_light from "@/src/assets/logo_light.png";
import Logo_dark from "@/src/assets/logo_dark.png";
import {
  MotionDiv,
  MotionH1,
  MotionH2,
  MotionP,
  MotionSpan,
  MotionForm,
} from "@/src/components/motion-components";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Sending recovery instructions...");
    const userData = { email: email };

    const res = await forgotPassword(userData);

    if (res?.err) {
      setIsLoading(false);
      toast.error(res?.message, { id: toastId });
    } else {
      setIsSuccess(true);
      setIsLoading(false);
      setEmail("");
      toast.success("Recovery instructions sent successfully.", {
        id: toastId,
      });
    }
  };

  // Select the appropriate background image based on theme
  const currentTheme = mounted ? theme : "light";
  const backgroundImage = currentTheme === "dark" ? registerBg : registerBg2;
  const Logo = currentTheme === "dark" ? Logo_dark : Logo_light;

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
      className="min-h-screen relative overflow-hidden"
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
          alt="Forgot password background"
          className="object-cover"
          quality={85}
          src={backgroundImage}
        />
      </MotionDiv>

      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-black/0 to-black/5" />

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
                  <span className="text-inherit">Forgot</span>{" "}
                  <MotionSpan
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-brand-contrast"
                    initial={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    Password
                  </MotionSpan>
                  <span className="text-inherit">?</span>
                </MotionH1>
                <MotionP
                  animate={{ opacity: 1 }}
                  className="text-inherit/90 drop-shadow-md"
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  Reset your{" "}
                  <span className="text-brand-contrast font-semibold">
                    WARDEN
                  </span>{" "}
                  <span className="text-inherit/90">
                    account password securely
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
                {isSuccess ? (
                  <MotionDiv
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-4 items-center text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <MotionDiv
                      animate={{ scale: 1 }}
                      className="w-12 h-12 bg-brand-primary/20 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      transition={{ duration: 0.4, delay: 0.5, type: "spring" }}
                    >
                      <Mail className="w-6 h-6 text-brand-primary" />
                    </MotionDiv>
                    <MotionH2
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl font-semibold"
                      initial={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      Check Your Email
                    </MotionH2>
                    <MotionP
                      animate={{ opacity: 1, y: 0 }}
                      className="text-default-500"
                      initial={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                    >
                      We&apos;ve sent password reset instructions to your email.
                      Check your inbox and follow the link to reset your
                      password.
                    </MotionP>
                    <MotionDiv
                      animate={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        as={Link}
                        className="mt-4"
                        color="primary"
                        href="/login"
                        startContent={<ArrowLeft size={16} />}
                        variant="flat"
                      >
                        Back to Login
                      </Button>
                    </MotionDiv>
                  </MotionDiv>
                ) : (
                  <>
                    <MotionDiv
                      className="flex flex-col gap-4 items-center mb-6"
                      variants={itemVariants}
                    >
                      <MotionDiv
                        animate={{ scale: 1, rotate: 0 }}
                        initial={{ scale: 0, rotate: -180 }}
                        transition={{
                          duration: 0.6,
                          delay: 0.4,
                          type: "spring",
                        }}
                      >
                        <Image
                          alt="Logo"
                          className="rounded-2xl"
                          height={60}
                          src={Logo}
                          width={60}
                        />
                      </MotionDiv>
                      <MotionP
                        animate={{ opacity: 1 }}
                        className="text-sm text-default-500 text-center"
                        initial={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                      >
                        Enter your email address and we&apos;ll send you a link
                        to reset your password.
                      </MotionP>
                    </MotionDiv>
                    <MotionForm
                      className="flex flex-col gap-4"
                      variants={itemVariants}
                      onSubmit={handleSubmit}
                    >
                      <MotionDiv
                        animate={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                      >
                        <Input
                          label="Email Address"
                          labelPlacement="outside"
                          placeholder="Enter your email address"
                          startContent={
                            <Mail className="text-default-400" size={16} />
                          }
                          type="email"
                          value={email}
                          onValueChange={setEmail}
                        />
                      </MotionDiv>
                      <MotionDiv
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, delay: 0.8 }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className="mt-2 h-12 text-lg font-semibold bg-brand-primary hover:bg-brand-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                          isLoading={isLoading}
                          spinner={<Spinner color="white" size="sm" />}
                          type="submit"
                        >
                          {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                      </MotionDiv>
                      <MotionDiv
                        animate={{ opacity: 1 }}
                        className="flex justify-center mt-4"
                        initial={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          as={Link}
                          color="primary"
                          href="/login"
                          variant="light"
                        >
                          Back to Login
                        </Button>
                      </MotionDiv>
                    </MotionForm>
                  </>
                )}
              </MotionDiv>
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}
