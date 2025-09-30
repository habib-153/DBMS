"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { AlertTriangle, Bug, Clipboard } from "lucide-react";
import { toast } from "sonner";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/30">
            <AlertTriangle className="text-red-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Crime Reporting Portal — Error
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We ran into a problem while loading the incident report or related
              data. You can retry or copy the error details and share with the
              support team.
            </p>
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          <div className="text-sm text-gray-700 dark:text-gray-300 break-words">
            {error?.message ?? "Unknown error"}
          </div>

          <div className="flex items-center gap-3">
            <Button color="primary" onClick={() => reset()}>
              Retry
            </Button>

            <Button variant="bordered" onClick={() => setExpanded((v) => !v)}>
              <Bug className="w-4 h-4 mr-2" />
              {expanded ? "Hide details" : "Show details"}
            </Button>

            <Button variant="light" onClick={copyError}>
              <Clipboard className="w-4 h-4 mr-2" />
              Copy details
            </Button>

            <Button
              variant="bordered"
              onClick={() =>
                (window.location.href =
                  "mailto:support@crime-portal.example?subject=Incident%20report%20error")
              }
            >
              Report issue
            </Button>
          </div>

          {expanded && (
            <pre className="overflow-auto max-h-64 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded">
              {error?.stack ?? error?.message}
            </pre>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
