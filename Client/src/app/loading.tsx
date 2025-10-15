import React from "react";
import { MapPin } from "lucide-react";
import { Card, CardBody, Spinner } from "@heroui/react";

import {
  MotionDiv,
  MotionH3,
  MotionP,
} from "@/src/components/motion-components";

export default function Loading() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
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

  return (
    <MotionDiv
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6"
      initial="hidden"
      variants={containerVariants}
    >
      <MotionDiv
        transition={{ duration: 0.2 }}
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="w-full max-w-md">
          <CardBody className="flex flex-col items-center gap-4 py-10">
            <MotionDiv
              animate={{ rotate: 360 }}
              className="p-4 rounded-full bg-white shadow-sm dark:bg-gray-800"
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              variants={itemVariants}
            >
              <Spinner className="w-10 h-10 text-primary-600" />
            </MotionDiv>

            <MotionH3
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-gray-900 dark:text-gray-100"
              initial={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              variants={itemVariants}
            >
              Loading incident
            </MotionH3>
            <MotionP
              animate={{ opacity: 1 }}
              className="text-sm text-gray-600 dark:text-gray-400 text-center"
              initial={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              variants={itemVariants}
            >
              Retrieving the incident details, images, and community comments.
              This usually completes quickly.
            </MotionP>

            <MotionDiv
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-sm text-gray-500"
              initial={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              variants={itemVariants}
            >
              <MotionDiv
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <MapPin className="w-4 h-4 text-rose-500" />
              </MotionDiv>
              <span>Pulling incident location and nearby reports…</span>
            </MotionDiv>
          </CardBody>
        </Card>
      </MotionDiv>
    </MotionDiv>
  );
}
