import { Button } from "@nextui-org/button";
import { PressEvent } from "@react-types/shared";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import React, { useRef } from "react";
import { SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import FXInput from "@/src/components/form/FXInput";
import FXForm from "@/src/components/form/FXForm";
import { changePassword } from "@/src/services/AuthService";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePassword = ({ isOpen, onOpenChange }: ChangePasswordModalProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleChangePassword: SubmitHandler<{ oldPassword: string; newPassword: string }> = async(data) => {
    const toastId = toast.loading("Changing password...");

    const res = await changePassword(data);

    if(res?.err){
        onOpenChange(false);
        toast.error(res?.message, {id: toastId});
    }else{
        onOpenChange(false);
        toast.success("Password Changed Successfully", {id: toastId})
    }
  };

  const handleSubmit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  return (
    <Modal
      classNames={{
        body: "py-6",
        backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
        base: "border-[#292f46] bg-white dark:bg-[#19172c] text-[#a8b0d3]",
        header: "border-b-[1px] border-[#292f46]",
        footer: "border-t-[1px] border-[#292f46]",
      }}
      isOpen={isOpen}
      size="md"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose: ((e: PressEvent) => void) | undefined) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center justify-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Change Password
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="">
                <FXForm ref={formRef} onSubmit={handleChangePassword}>
                  <div className="py-3">
                    <FXInput
                      label="Old Password"
                      name="oldPassword"
                      type="password"
                    />
                  </div>
                  <div className="py-3">
                    <FXInput
                      label="New Password"
                      name="newPassword"
                      type="password"
                    />
                  </div>
                </FXForm>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className="flex-1"
                color="danger"
                variant="light"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button className="flex-1" color="primary" onPress={handleSubmit}>
                Change Password
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ChangePassword;
