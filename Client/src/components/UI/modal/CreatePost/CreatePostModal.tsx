import {
  Button,
  Divider,
  Modal,
  ModalContent,
  Select,
  SelectItem,
} from "@heroui/react";
import React, { ChangeEvent, useState, useEffect } from "react";
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { useRouter } from "next/navigation";

import Loading from "../../Loading";

import CTDatePicker from "@/src/components/form/CTDatePicker";
import FXInput from "@/src/components/form/FXInput";
import FXTextarea from "@/src/components/form/FXTextArea";
import generateImageDescription from "@/src/services/ImageDescription";
import { useCreatePost } from "@/src/hooks/post.hook";
import { useUser } from "@/src/context/user.provider";
import dateToISO from "@/src/utils/dateToISO";
import { IPost } from "@/src/types";

interface IPostModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CreatePostModal = ({ isOpen, setIsOpen }: IPostModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[] | []>([]);
  const [imagePreviews, setImagePreviews] = useState<string[] | []>([]);

  const { user } = useUser();

  const router = useRouter();

  const {
    mutate: handleCreatePost,
    isPending: createPostPending,
    isSuccess,
  } = useCreatePost();

  const methods = useForm();

  const { handleSubmit } = methods;

  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [divisionsLoading, setDivisionsLoading] = useState(false);

  // Load divisions on component mount
  useEffect(() => {
    setDivisionsLoading(true);

    fetch("https://bdapi.vercel.app/api/v.1/division")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setDivisions(data.data);
        } else {
          throw new Error("Invalid data format");
        }
      })
      .catch((error) => {
        setError(`Failed to load divisions: ${error.message}`);
        setDivisions([]);
      })
      .finally(() => {
        setDivisionsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      fetch(`https://bdapi.vercel.app/api/v.1/district/${selectedDivision}`)
        .then((response) => response.json())
        .then((data) => setDistricts(data.data))
        .catch(() => {
          setError("Failed to load districts");
        });
    }
  }, [selectedDivision]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    // Validation
    if (!selectedDivision || !selectedDistrict) {
      setError("Please select both division and district");

      return;
    }

    if (imageFiles.length === 0) {
      setError("Please upload an image");

      return;
    }

    const formData = new FormData();

    const divisionName =
      divisions.find((div) => div.id === selectedDivision)?.name || "";
    const districtName =
      districts.find((dist) => dist.id === selectedDistrict)?.name || "";

    const postData: Partial<IPost> = {
      ...data,
      crimeDate: dateToISO(data.crimeDate),
      postDate: new Date(),
      author: user!.id,
      division: selectedDivision,
      district: selectedDistrict,
      location: `${divisionName}, ${districtName}`,
    };

    // Append the data correctly
    formData.append("data", JSON.stringify(postData));

    if (imageFiles.length > 0) {
      formData.append("image", imageFiles[0]);
    }

    handleCreatePost(formData);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    // Clear previous images and set new ones
    setImageFiles([]);
    setImagePreviews([]);

    Array.from(files).forEach((file) => {
      setImageFiles((prev) => [...prev, file]);

      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDescriptionGeneration = async () => {
    setIsLoading(true);
    try {
      const response = await generateImageDescription(
        imagePreviews[0],
        "write a description for this scenario based on the image"
      );

      methods.setValue("description", response);
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    methods.reset();
    setImageFiles([]);
    setImagePreviews([]);
    setSelectedDivision("");
    setSelectedDistrict("");
    setDistricts([]); // Only clear districts, not divisions
    setError("");
  };

  // Clear error when user starts interacting
  const clearError = () => {
    if (error) setError("");
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsOpen(open);
  };

  if (!createPostPending && isSuccess) {
    resetForm();
    router.push("/posts");
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        scrollBehavior="outside"
        size="3xl"
        onOpenChange={handleModalClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              {createPostPending && <Loading />}
              <div className="h-full rounded-xl bg-gradient-to-b from-default-100 px-[50px] py-6">
                <h1 className="text-2xl font-semibold">Post a Crime</h1>
                <Divider className="mb-5 mt-3" />

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <FormProvider {...methods}>
                  <form onChange={clearError} onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-wrap gap-2 py-2">
                      <div className="min-w-fit flex-1">
                        <FXInput isRequired label="Title" name="title" />
                      </div>
                      <div className="min-w-fit flex-1">
                        <CTDatePicker
                          required
                          label="Crime date"
                          name="crimeDate"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 py-2">
                      <div className="min-w-fit flex-1">
                        <Select
                          className="w-full"
                          classNames={{
                            trigger:
                              "bg-gray-50 dark:bg-gray-800 border-1 border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 data-[focus=true]:border-brand-primary",
                          }}
                          isDisabled={divisionsLoading}
                          isLoading={divisionsLoading}
                          label="Division"
                          placeholder={
                            divisionsLoading
                              ? "Loading divisions..."
                              : "Select Division"
                          }
                          selectedKeys={
                            selectedDivision ? [selectedDivision] : []
                          }
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as string;

                            setSelectedDivision(selected || "");
                            setSelectedDistrict(""); // Reset district when division changes
                          }}
                        >
                          {divisions.map((division) => (
                            <SelectItem key={division.id}>
                              {division.name}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div className="min-w-fit flex-1">
                        <Select
                          className="w-full"
                          classNames={{
                            trigger:
                              "bg-gray-50 dark:bg-gray-800 border-1 border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 data-[focus=true]:border-brand-primary",
                          }}
                          isDisabled={!selectedDivision}
                          label="District"
                          placeholder="Select District"
                          selectedKeys={
                            selectedDistrict ? [selectedDistrict] : []
                          }
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as string;

                            setSelectedDistrict(selected || "");
                          }}
                        >
                          {districts.map((district) => (
                            <SelectItem key={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 py-2">
                      <div className="min-w-fit flex-1">
                        <label
                          className="flex h-14 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-default-200 text-default-500 shadow-sm transition-all duration-100 hover:border-default-400"
                          htmlFor="image"
                        >
                          Upload image
                        </label>
                        <input
                          multiple
                          className="hidden"
                          id="image"
                          type="file"
                          onChange={(e) => handleImageChange(e)}
                        />
                      </div>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="flex gap-5 my-5 flex-wrap">
                        {imagePreviews.map((imageDataUrl, index) => (
                          <div
                            key={imageDataUrl}
                            className="relative size-48 rounded-xl border-2 border-dashed border-default-300 p-2"
                          >
                            <img
                              alt="item"
                              className="h-full w-full object-cover object-center rounded-md"
                              src={imageDataUrl}
                            />
                            <button
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                              type="button"
                              onClick={() => {
                                setImageFiles((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                                setImagePreviews((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap-reverse gap-2 py-2">
                      <div className="min-w-fit flex-1">
                        <FXTextarea
                          required
                          label="Description"
                          name="description"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-5">
                      {methods.getValues("description") && (
                        <Button
                          onClick={() => methods.resetField("description")}
                        >
                          Clear
                        </Button>
                      )}
                      <Button
                        isDisabled={imagePreviews.length > 0 ? false : true}
                        isLoading={isLoading}
                        onClick={() => handleDescriptionGeneration()}
                      >
                        {isLoading ? "Generating...." : "Generate with AI"}
                      </Button>
                    </div>

                    <Divider className="my-5" />

                    <Divider className="my-5" />
                    <div className="flex justify-end">
                      <Button color="danger" variant="light" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button size="lg" type="submit">
                        Post
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePostModal;
