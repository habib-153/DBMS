"use client";

import dynamic from "next/dynamic";

// Dynamically import framer-motion components with SSR disabled
export const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.div })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full animate-pulse bg-gray-50 dark:bg-gray-800" />
    ),
  }
);

export const MotionPre = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.pre })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-6 animate-pulse bg-gray-50 dark:bg-gray-800" />
    ),
  }
);

export const MotionH1 = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.h1 })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-12 animate-pulse bg-gray-50 dark:bg-gray-800" />
    ),
  }
);

export const MotionH2 = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.h2 })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-10 animate-pulse bg-gray-50 dark:bg-gray-800" />
    ),
  }
);

export const MotionH3 = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.h3 })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-8 animate-pulse bg-gray-50 dark:bg-gray-800" />
    ),
  }
);

export const MotionP = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.p })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-6 animate-pulse bg-gray-50 dark:bg-gray-800" />
    ),
  }
);

export const MotionSpan = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.span })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-6 animate-pulse bg-gray-50 dark:bg-gray-800" />
    ),
  }
);

export const MotionForm = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.form })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-10 animate-pulse bg-gray-50 dark:bg-gray-800" />
    ),
  }
);

export const MotionImg = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.img })),
  {
    ssr: false,
    loading: () => <div />,
  }
);
