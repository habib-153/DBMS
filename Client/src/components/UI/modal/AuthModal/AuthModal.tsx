/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface IAuthModalProps {
  openAuthModal: boolean;
  setOpenAuthModal: (open: boolean) => void;
}

const AuthModal = ({ openAuthModal, setOpenAuthModal }: IAuthModalProps) => {
  return (
    <Modal
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
      }} 
      isOpen={openAuthModal}
      placement="center"
      onOpenChange={setOpenAuthModal}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col items-center gap-1">
              <div className="rounded-full bg-danger/10 p-3 mb-2">
                <AlertCircle className="h-6 w-6 text-danger" />
              </div>
              <h3 className="text-lg font-semibold">Authentication Required</h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-center text-sm text-default-500">
                Please log in to create a crime report.
              </p>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-2">
              <Link href="/login">
                <Button 
                  color="primary" 
                  variant="solid"
                >
                  Login
                </Button>
              </Link>
              <Button 
                color="danger" 
                variant="light" 
                onPress={onClose}
              >
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
