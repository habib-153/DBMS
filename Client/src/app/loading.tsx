import React from "react";
import { MapPin } from "lucide-react";
import { Card, CardBody, Spinner } from "@heroui/react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center gap-4 py-10">
          <div className="p-4 rounded-full bg-white shadow-sm dark:bg-gray-800">
            <Spinner className="w-10 h-10 text-primary-600" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Loading incident
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Retrieving the incident details, images, and community comments.
            This usually completes quickly.
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Pulling incident location and nearby reports…</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
