import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { PressEvent } from "@react-types/shared";
import { ChangeEvent, useRef, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { Camera, X, Loader2 } from "lucide-react";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const { mutate: handleUpdateUser, isPending } = useUpdateUser();

  const handleUpdate: SubmitHandler<FieldValues> = (data) => {
    const formData = new FormData();

    formData.append("data", JSON.stringify(data));
    if (imageFile) {
      formData.append("profilePhoto", imageFile);
    }

    handleUpdateUser(formData, {
      onSuccess: () => {
        // Reset form state after successful update
        setImageFile(null);
        setImagePreview(null);
        onOpenChange(false);
      },
    });
  };

  const handleSubmit = () => {
    if (formRef.current && !isPending) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  return (
    <Modal
      classNames={{
        body: "py-6",
        backdrop: "bg-black/60 backdrop-blur-sm",
        base: "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
        header: "border-b border-gray-200 dark:border-gray-700",
        footer: "border-t border-gray-200 dark:border-gray-700",
        closeButton:
          "hover:bg-brand-primary/10 active:bg-brand-primary/20 text-brand-primary",
      }}
      isDismissable={!isPending}
      isOpen={isOpen}
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose: ((e: PressEvent) => void) | undefined) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                Update Profile
              </h2>
              <p className="text-sm text-gray-500 font-normal">
                Update your personal information and profile picture
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="w-full space-y-6">
                <FXForm
                  ref={formRef}
                  defaultValues={{
                    name: user?.name,
                    email: user.email,
                    phone: user?.phone,
                  }}
                  onSubmit={handleUpdate}
                >
                  <div className="space-y-4">
                    <FXInput
                      classNames={{
                        input: "focus:border-brand-primary",
                        label: "text-gray-700 dark:text-gray-300",
                      }}
                      isDisabled={isPending}
                      label="Full Name"
                      name="name"
                      type="text"
                    />

                    <FXInput
                      isReadOnly
                      classNames={{
                        input:
                          "focus:border-brand-primary bg-gray-50 dark:bg-gray-800",
                        label: "text-gray-700 dark:text-gray-300",
                      }}
                      isDisabled={isPending}
                      label="Email"
                      name="email"
                      type="email"
                    />

                    <FXInput
                      classNames={{
                        input: "focus:border-brand-primary",
                        label: "text-gray-700 dark:text-gray-300",
                      }}
                      isDisabled={isPending}
                      label="Mobile Number"
                      name="phone"
                      type="text"
                    />
                  </div>
                </FXForm>

                {/* Image Upload Section */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profile Picture
                  </div>

                  {imagePreview ? (
                    <div className="relative w-full">
                      <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-brand-primary/20">
                        <img
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                          src={imagePreview}
                        />
                        {!isPending && (
                          <button
                            aria-label="Remove image"
                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                            type="button"
                            onClick={removeImage}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {isPending && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-2" />
                              <p className="text-sm font-medium">
                                Uploading image...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <label
                      className={`flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed transition-all duration-200 ${
                        isPending
                          ? "cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
                          : "cursor-pointer border-gray-300 dark:border-gray-600 hover:border-brand-primary dark:hover:border-brand-primary bg-gray-50 dark:bg-gray-800/50 hover:bg-brand-primary/5"
                      }`}
                      htmlFor="image"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-10 h-10 mb-3 text-brand-primary" />
                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-brand-primary">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG or JPEG (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        accept="image/*"
                        className="hidden"
                        disabled={isPending}
                        id="image"
                        type="file"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="gap-2">
              <Button
                className="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                isDisabled={isPending}
                variant="bordered"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-brand-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all min-w-[120px]"
                isLoading={isPending}
                spinner={<Loader2 className="w-5 h-5 animate-spin" />}
                onPress={handleSubmit}
              >
                {isPending ? "Updating..." : "Update Profile"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateProfileModal;
