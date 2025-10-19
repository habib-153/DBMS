"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { FileQuestion, ArrowLeft, LifeBuoy, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  MotionDiv,
  MotionH1,
  MotionP,
} from "@/src/components/motion-components";

export default function NotFoundPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
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
      transition: { duration: 0.5 },
    },
  };

  const floatingVariants = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <MotionDiv
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-rose-50 to-orange-50 dark:from-gray-900 dark:via-rose-900/20 dark:to-gray-900 p-6 relative overflow-hidden"
      initial="hidden"
      variants={containerVariants}
    >
      {/* Floating background elements */}
      <MotionDiv
        animate={floatingVariants}
        className="absolute top-10 right-20 opacity-10"
      >
        <FileQuestion className="w-40 h-40 text-rose-500" />
      </MotionDiv>
      <MotionDiv
        animate={floatingVariants}
        className="absolute bottom-10 left-20 opacity-10"
        style={{ animationDelay: "1.5s" }}
      >
        <Search className="w-32 h-32 text-orange-500" />
      </MotionDiv>

      <MotionDiv variants={itemVariants} whileHover={{ scale: 1.02 }}>
        <Card className="max-w-2xl w-full shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
          <CardBody className="text-center py-12">
            <MotionDiv
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              className="mx-auto mb-4 w-28 h-28 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 flex items-center justify-center shadow-lg"
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FileQuestion className="w-12 h-12 text-rose-600" />
            </MotionDiv>

            <MotionH1
              className="mb-3 text-3xl font-bold text-gray-800 dark:text-gray-100"
              variants={itemVariants}
            >
              Report not found
            </MotionH1>

            <MotionP
              className="mb-6 text-gray-600 dark:text-gray-400 px-4"
              variants={itemVariants}
            >
              The incident report you tried to access does not exist or has been
              removed. You can create a new report or return to the homepage.
            </MotionP>

            <MotionDiv
              className="flex flex-col sm:flex-row gap-3 justify-center"
              variants={itemVariants}
            >
              <MotionDiv
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="font-semibold"
                  color="primary"
                  size="lg"
                  variant="solid"
                  onClick={() => router.push("/")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </MotionDiv>

              <MotionDiv
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="font-semibold"
                  color="default"
                  size="lg"
                  variant="bordered"
                  onClick={() => router.push("/posts")}
                >
                  Browse Reports
                </Button>
              </MotionDiv>
            </MotionDiv>

            <MotionDiv
              className="mt-8 text-sm text-gray-500 dark:text-gray-400"
              variants={itemVariants}
            >
              <MotionDiv
                animate={{ rotate: [0, 15, -15, 0] }}
                className="inline-block"
                transition={{ duration: 2, repeat: Infinity }}
              >
                <LifeBuoy className="inline mr-2 w-4 h-4 text-rose-500" />
              </MotionDiv>
              Need help? Visit our{" "}
              <Button variant="light" onClick={() => router.push("/about")}>
                About page
              </Button>
            </MotionDiv>
          </CardBody>
        </Card>
      </MotionDiv>
    </MotionDiv>
  );
}
