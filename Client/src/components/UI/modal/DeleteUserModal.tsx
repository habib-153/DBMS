"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

const DeleteUserModal = ({
  isOpen,
  userName,
  userEmail,
  isDeleting,
  onConfirm,
  onOpenChange,
}: DeleteUserModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="w-6 h-6" />
                <span>Delete User</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete this user?
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                  <p className="font-semibold">{userName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userEmail}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> This action cannot be undone. The
                    user will be marked as deleted and all their posts will be
                    preserved but attributed to a deleted user.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
                isLoading={isDeleting}
              >
                Delete User
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteUserModal;
