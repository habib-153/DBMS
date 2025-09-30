"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { FileQuestion, ArrowLeft, LifeBuoy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="max-w-2xl w-full">
        <CardBody className="text-center py-12">
          <div className="mx-auto mb-4 w-28 h-28 rounded-full bg-rose-50 flex items-center justify-center">
            <FileQuestion className="w-12 h-12 text-rose-600" />
          </div>

          <h1 className="mb-3 text-3xl font-bold text-gray-800 dark:text-gray-100">
            Report not found
          </h1>

          <p className="mb-6 text-gray-600 dark:text-gray-400">
            The incident report you tried to access does not exist or has been
            removed. You can create a new report or return to the homepage.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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

            <Button
              className="font-semibold"
              color="default"
              size="lg"
              variant="bordered"
              onClick={() => router.push("/reports/create")}
            >
              Report an incident
            </Button>
          </div>

          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <LifeBuoy className="inline mr-2 w-4 h-4 text-rose-500" />
            Need help? Visit our{" "}
            <Button variant="light" onClick={() => router.push("/contact")}>
              Contact page
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
