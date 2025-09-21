import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { PressEvent } from "@react-types/shared";
import { ChangeEvent, useRef, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";

import { IUser } from "@/src/types";
import { useUpdateUser } from "@/src/hooks/user.hook";
import FXForm from "@/src/components/form/FXForm";
import FXInput from "@/src/components/form/FXInput";

interface UpdateProfileModalProps {
  isOpen: boolean;
  user: IUser;
  onOpenChange: (open: boolean) => void;
}

const UpdateProfileModal = ({
  isOpen,
  onOpenChange,
  user,
}: UpdateProfileModalProps) => {
  const [imageFile, setImageFile] = useState<File | "">("");
  const [imagePreview, setImagePreview] = useState<string | "">();
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];

    setImageFile(file);

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const { mutate: handleUpdateUser } = useUpdateUser();

  const handleUpdate: SubmitHandler<FieldValues> = (data) => {
    const formData = new FormData()

    formData.append("data", JSON.stringify(data));
    formData.append("profilePhoto", imageFile);

    handleUpdateUser(formData);
    onOpenChange(false);
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
      size="3xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose: ((e: PressEvent) => void) | undefined) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center justify-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Update Profile
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="w-full">
                <FXForm
                  ref={formRef}
                  defaultValues={{
                    name: user?.name,
                    email: user.email,
                    mobileNumber: user?.mobileNumber,
                  }}
                  onSubmit={handleUpdate}
                >
                  <div className="py-3">
                    <FXInput label="Full Name" name="name" type="text" />
                  </div>
                  <div className="py-3">
                    <FXInput label="Email" name="email" type="email" />
                  </div>
                  <div className="py-3">
                    <FXInput label="Mobile Number" name="mobileNumber" type="text" />
                  </div>

                  <div className="min-w-fit flex-1">
                    <label
                      className="flex h-14 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-default-200 text-default-500 shadow-sm transition-all duration-100 hover:border-default-400"
                      htmlFor="image"
                    >
                      Upload image
                    </label>
                    <input
                      className="hidden"
                      id="image"
                      type="file"
                      onChange={(e) => handleImageChange(e)}
                    />
                  </div>
                  {imagePreview && (
                    <div className="flex gap-5 my-5 flex-wrap">
                      <div
                        key={imagePreview}
                        className="relative size-48 rounded-xl border-2 border-dashed border-default-300 p-2"
                      >
                        <img
                          alt="item"
                          className="h-full w-full object-cover object-center rounded-md"
                          src={imagePreview}
                        />
                      </div>
                    </div>
                  )}
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
                Update Profile
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateProfileModal;