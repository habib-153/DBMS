"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { AlertTriangle } from "lucide-react";

interface DeletePostModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  postTitle: string;
}

export default function DeletePostModal({
  isOpen,
  onOpenChange,
  onConfirm,
  isDeleting,
  postTitle,
}: DeletePostModalProps) {
  return (
    <Modal
      isDismissable={!isDeleting}
      isOpen={isOpen}
      size="md"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-danger" />
                <span>Delete Post</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this post?
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mt-2">
                &quot;{postTitle}&quot;
              </p>
              <p className="text-sm text-danger mt-2">
                This action cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                isDisabled={isDeleting}
                variant="light"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-danger text-white"
                isLoading={isDeleting}
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Delete Post
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
