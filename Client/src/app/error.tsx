"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { AlertTriangle, Bug, Clipboard } from "lucide-react";
import { toast } from "sonner";

import {
  MotionDiv,
  MotionH2,
  MotionP,
  MotionPre,
} from "@/src/components/motion-components";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Log the error to the console (and could be sent to external service)
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  const copyError = async () => {
    try {
      await navigator.clipboard.writeText(String(error.stack || error.message));
      toast.success("Error details copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy error details");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const floatingVariants = {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <MotionDiv
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-gray-900 p-6 relative overflow-hidden"
      initial="hidden"
      variants={containerVariants}
    >
      {/* Floating background elements */}
      <MotionDiv
        animate={floatingVariants}
        className="absolute top-20 left-10 opacity-10"
      >
        <AlertTriangle className="w-32 h-32 text-red-500" />
      </MotionDiv>
      <MotionDiv
        animate={floatingVariants}
        className="absolute bottom-20 right-10 opacity-10"
        style={{ animationDelay: "1s" }}
      >
        <Bug className="w-24 h-24 text-orange-500" />
      </MotionDiv>

      <MotionDiv
        transition={{ duration: 0.2 }}
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="max-w-2xl w-full shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
          <CardHeader className="flex items-center gap-3">
            <MotionDiv
              animate={{
                scale: 1,
                rotate: 0,
                y: [0, -5, 0],
              }}
              className="p-2 rounded-md bg-red-50 dark:bg-red-900/30"
              initial={{ scale: 0, rotate: -180 }}
              transition={{
                scale: { duration: 0.5, delay: 0.2, type: "spring" },
                rotate: { duration: 0.5, delay: 0.2, type: "spring" },
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <AlertTriangle className="text-red-600 w-6 h-6" />
            </MotionDiv>
            <MotionDiv variants={itemVariants}>
              <MotionH2
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                initial={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                Crime Reporting Portal — Error
              </MotionH2>
              <MotionP
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                We ran into a problem while loading the incident report or
                related data. You can retry or copy the error details and share
                with the support team.
              </MotionP>
            </MotionDiv>
          </CardHeader>

          <CardBody className="space-y-4">
            <MotionDiv
              animate={{ opacity: 1 }}
              className="text-sm text-gray-700 dark:text-gray-300 break-words"
              initial={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              variants={itemVariants}
            >
              {error?.message ?? "Unknown error"}
            </MotionDiv>

            <MotionDiv
              className="flex items-center gap-3"
              variants={itemVariants}
            >
              <MotionDiv
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button color="primary" onClick={() => reset()}>
                  Retry
                </Button>
              </MotionDiv>

              <MotionDiv
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="bordered"
                  onClick={() => setExpanded((v) => !v)}
                >
                  <Bug className="w-4 h-4 mr-2" />
                  {expanded ? "Hide details" : "Show details"}
                </Button>
              </MotionDiv>

              <MotionDiv
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="light" onClick={copyError}>
                  <Clipboard className="w-4 h-4 mr-2" />
                  Copy details
                </Button>
              </MotionDiv>

              <MotionDiv
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="bordered"
                  onClick={() =>
                    (window.location.href =
                      "mailto:support@crime-portal.example?subject=Incident%20report%20error")
                  }
                >
                  Report issue
                </Button>
              </MotionDiv>
            </MotionDiv>

            {expanded && (
              <MotionPre
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-auto max-h-64 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded"
                exit={{ opacity: 0, height: 0 }}
                initial={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error?.stack ?? error?.message}
              </MotionPre>
            )}
          </CardBody>
        </Card>
      </MotionDiv>
    </MotionDiv>
  );
}
