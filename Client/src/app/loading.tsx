import React from "react";
import { MapPin, Shield, AlertTriangle } from "lucide-react";
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

  const floatingVariants = {
    y: [0, -15, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  const pulseVariants = {
    scale: [1, 1.05, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <MotionDiv
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 relative overflow-hidden"
      initial="hidden"
      variants={containerVariants}
    >
      {/* Floating background elements */}
      <MotionDiv
        animate={floatingVariants}
        className="absolute top-20 left-10 opacity-20"
        style={{ animationDelay: "0s" }}
      >
        <Shield className="w-24 h-24 text-blue-500" />
      </MotionDiv>
      <MotionDiv
        animate={floatingVariants}
        className="absolute bottom-20 right-10 opacity-20"
        style={{ animationDelay: "1s" }}
      >
        <AlertTriangle className="w-20 h-20 text-rose-500" />
      </MotionDiv>
      <MotionDiv
        animate={floatingVariants}
        className="absolute top-1/2 right-20 opacity-20"
        style={{ animationDelay: "0.5s" }}
      >
        <MapPin className="w-16 h-16 text-purple-500" />
      </MotionDiv>

      <MotionDiv
        transition={{ duration: 0.2 }}
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
          <CardBody className="flex flex-col items-center gap-4 py-10">
            <MotionDiv
              animate={{ rotate: 360 }}
              className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg"
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              variants={itemVariants}
            >
              <Spinner className="w-10 h-10 text-white" />
            </MotionDiv>

            {/* Pulsing rings */}
            <MotionDiv animate={pulseVariants} className="absolute">
              <div className="w-24 h-24 rounded-full border-2 border-blue-400" />
            </MotionDiv>
            <MotionDiv
              animate={pulseVariants}
              className="absolute"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-32 h-32 rounded-full border-2 border-purple-400" />
            </MotionDiv>

            <MotionH3
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4"
              initial={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              variants={itemVariants}
            >
              Loading incident
            </MotionH3>
            <MotionP
              animate={{ opacity: 1 }}
              className="text-sm text-gray-600 dark:text-gray-400 text-center px-6"
              initial={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              variants={itemVariants}
            >
              Retrieving the incident details, images, and community comments.
              This usually completes quickly.
            </MotionP>

            <MotionDiv
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-sm text-gray-500 mt-2"
              initial={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              variants={itemVariants}
            >
              <MotionDiv
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <MapPin className="w-4 h-4 text-rose-500" />
              </MotionDiv>
              <MotionDiv
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span>Pulling incident location and nearby reports…</span>
              </MotionDiv>
            </MotionDiv>

            {/* Loading dots */}
            <MotionDiv className="flex gap-2 mt-4">
              {[0, 1, 2].map((index) => (
                <MotionDiv
                  key={index}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  className="w-2 h-2 rounded-full bg-blue-500"
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                />
              ))}
            </MotionDiv>
          </CardBody>
        </Card>
      </MotionDiv>
    </MotionDiv>
  );
}
