"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import axiosInstance from "@/src/libs/AxiosInstance";
import { useUser } from "@/src/context/user.provider";

type Props = {
  email: string;
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
};

function formatTime(s: number) {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");

  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");

  return `${mm}:${ss}`;
}

function parseJwtPayload(token: string) {
  try {
    const parts = token.split(".");

    if (parts.length < 2) return null;

    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function VerifyOtpModal({
  email,
  open,
  onClose,
  onVerified,
}: Props) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(15 * 60);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { setUser, setIsLoading } = useUser();

  useEffect(() => {
    if (open) {
      setOtp("");
      setTimeLeft(15 * 60);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open || timeLeft === null) return;

    const t = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;

        if (prev <= 1) {
          clearInterval(t);

          return null;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [open, timeLeft]);

  const handleResend = async () => {
    try {
      setResendLoading(true);

      const resp = await axiosInstance.post("/auth/send-otp", { email });

      toast.success(resp?.data?.message || "OTP resent");

      setTimeLeft(15 * 60);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to resend OTP"
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.trim().length < 4) {
      toast.error("Please enter the OTP");

      return;
    }

    try {
      setLoading(true);

      const resp = await axiosInstance.post(
        "/auth/verify-otp",
        { email, otp },
        { withCredentials: true }
      );

      const data = resp?.data?.data || resp?.data || {};

      const accessToken =
        data?.accessToken ||
        (data && data.data && data.data.accessToken) ||
        null;

      if (accessToken) {
        const maxAge = 7 * 24 * 60 * 60;

        document.cookie = `accessToken=${accessToken}; path=/; max-age=${maxAge}`;

        const decoded = parseJwtPayload(accessToken) as any | null;

        if (decoded) {
          const user = {
            id: decoded.id || decoded._id || "",
            name: decoded.name || "",
            email: decoded.email || email,
            role: decoded.role || "USER",
            status: decoded.status || "ACTIVE",
            phone: decoded.phone || null,
            profilePhoto: decoded.profilePhoto || null,
            followers: [],
            following: [],
            isVerified: true,
            postCount: 0,
            totalUpVotes: 0,
          } as any;

          setIsLoading(false);
          setUser(user);
        }
      }

      toast.success(
        data?.message ||
          resp?.data?.message ||
          "Email verified successfully! Welcome to WARDEN."
      );

      // Auto-login after verification - navigate to home
      setTimeout(() => {
        onVerified && onVerified();
        onClose();
        router.push("/");
      }, 1000);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      aria-labelledby="verify-otp-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md glass-form-enhanced rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header with brand color */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3
            className="text-2xl font-bold mb-3 text-white drop-shadow-sm"
            id="verify-otp-title"
          >
            Verify Your Email
          </h3>
          <p className="text-sm text-gray-100 font-medium mb-1">
            We sent a 6-digit verification code to
          </p>
          <p className="text-base font-bold text-brand-primary mt-1">{email}</p>
        </div>

        {/* Timer Display */}
        <div
          aria-live="polite"
          className="mb-4 text-center py-3 px-4 bg-white/80 dark:bg-gray-700/80 rounded-lg border border-gray-200 dark:border-gray-600"
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 text-brand-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            <span className="text-base font-semibold text-gray-900 dark:text-white">
              {timeLeft !== null ? (
                <>
                  Code expires in{" "}
                  <span className="text-brand-primary font-bold text-lg">
                    {formatTime(timeLeft)}
                  </span>
                </>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-bold">
                  Code expired
                </span>
              )}
            </span>
          </div>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="sr-only" htmlFor="otp-input">
            Verification code
          </label>
          <input
            ref={inputRef}
            aria-label="Verification code"
            className="w-full p-4 text-center text-2xl font-bold tracking-[0.5em] border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
            id="otp-input"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
            }
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />
          <p className="text-sm text-gray-200 font-medium text-center mt-2">
            Enter the 6-digit code from your email
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-4">
          <Button
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all"
            isDisabled={otp.length < 6}
            isLoading={loading}
            size="lg"
            onClick={handleVerify}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
          <Button
            className="w-full text-white font-medium"
            isDisabled={timeLeft !== null && timeLeft > 0}
            isLoading={resendLoading}
            size="lg"
            variant="bordered"
            onClick={handleResend}
          >
            {resendLoading ? "Sending..." : "Resend Code"}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-200 mb-3 font-medium">
            Didn&apos;t receive the code? Check your spam folder or click
            Resend.
          </p>
          <button
            aria-label="Close verification modal"
            className="text-base text-brand-primary hover:text-brand-secondary font-semibold hover:underline transition-colors"
            onClick={onClose}
          >
            Cancel & Verify Later
          </button>
        </div>
      </div>
    </div>
  );
}
