"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  RadioGroup,
  Radio,
} from "@heroui/react";
import { AlertTriangle } from "lucide-react";

interface ReportPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string, description?: string) => void;
  isLoading?: boolean;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam or misleading" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "violence", label: "Violence or dangerous content" },
  { value: "harassment", label: "Harassment or hate speech" },
  { value: "false_info", label: "False information" },
  { value: "other", label: "Other" },
];

export default function ReportPostModal({
  isOpen,
  onClose,
  onReport,
  isLoading = false,
}: ReportPostModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleSubmit = () => {
    if (!selectedReason) {
      return;
    }

    const reasonLabel =
      REPORT_REASONS.find((r) => r.value === selectedReason)?.label ||
      selectedReason;

    onReport(reasonLabel, description || undefined);
    handleClose();
  };

  const handleClose = () => {
    setSelectedReason("");
    setDescription("");
    onClose();
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        backdrop: "bg-black/50",
        base: "border border-gray-200 dark:border-gray-700",
      }}
      isOpen={isOpen}
      size="lg"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 text-danger-600">
          <AlertTriangle size={24} />
          <span>Report Post</span>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Help us understand what&apos;s wrong with this post. Your report
              is anonymous.
            </p>

            <RadioGroup
              classNames={{
                label: "text-sm font-medium",
              }}
              label="Reason for reporting"
              value={selectedReason}
              onValueChange={setSelectedReason}
            >
              {REPORT_REASONS.map((reason) => (
                <Radio key={reason.value} value={reason.value}>
                  {reason.label}
                </Radio>
              ))}
            </RadioGroup>

            <Textarea
              classNames={{
                input: "resize-y",
              }}
              label="Additional details (optional)"
              maxRows={5}
              minRows={3}
              placeholder="Provide more context about why you're reporting this post..."
              value={description}
              onValueChange={setDescription}
            />

            {/* <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Each report reduces the post&apos;s
                verification score by 5 points. Posts with 10 or more reports
                will be automatically removed.
              </p>
            </div> */}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button disabled={isLoading} variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="danger"
            isDisabled={!selectedReason || isLoading}
            isLoading={isLoading}
            onPress={handleSubmit}
          >
            Submit Report
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
