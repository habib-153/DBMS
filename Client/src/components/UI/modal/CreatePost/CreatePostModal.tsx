import { Button, Divider, Modal, ModalContent } from "@heroui/react";
import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { useRouter } from "next/navigation";

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
  const [successMessage, setSuccessMessage] = useState("");
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
  const [showDivisionDropdown, setShowDivisionDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  // Load divisions when modal opens
  useEffect(() => {
    if (!isOpen || divisions.length > 0 || divisionsLoading) return;

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
  }, [isOpen]);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Don't close if clicking on the dropdown button or dropdown content
      if (target.closest(".dropdown-container")) {
        return;
      }

      setShowDivisionDropdown(false);
      setShowDistrictDropdown(false);
    };

    if (showDivisionDropdown || showDistrictDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDivisionDropdown, showDistrictDropdown]);

  // Check if all required fields are filled
  const isFormValid = useCallback(() => {
    const formData = methods.watch();

    return (
      formData.title &&
      formData.title.trim() !== "" &&
      formData.crimeDate &&
      selectedDivision !== "" &&
      selectedDistrict !== "" &&
      imageFiles.length > 0 &&
      formData.description &&
      formData.description.trim() !== ""
    );
  }, [methods, selectedDivision, selectedDistrict, imageFiles.length]);

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

  const handleImageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    // Clear previous images and set new ones
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      newFiles.push(file);

      const reader = new FileReader();

      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setImageFiles(newFiles);
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

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

  const resetForm = useCallback(() => {
    methods.reset();
    setImageFiles([]);
    setImagePreviews([]);
    setSelectedDivision("");
    setSelectedDistrict("");
    setDistricts([]);
    setError("");
    setSuccessMessage("");
    setShowDivisionDropdown(false);
    setShowDistrictDropdown(false);
  }, [methods]);

  // Clear messages when user starts interacting
  const clearMessages = () => {
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  // Handle post creation success
  useEffect(() => {
    if (!createPostPending && isSuccess) {
      setSuccessMessage("Crime report posted successfully!");
      setError("");
      // Small delay to show success before closing
      setTimeout(() => {
        resetForm();
        setSuccessMessage("");
        setIsOpen(false);
        // router.push("/posts");
      }, 1500);
    }
  }, [createPostPending, isSuccess, router, setIsOpen, resetForm]);

  const handleModalClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsOpen(open);
  };

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
              <div
                className={`h-full rounded-xl bg-gradient-to-b from-default-100 px-[50px] py-6 ${createPostPending ? "pointer-events-none opacity-75" : ""}`}
              >
                <h1 className="text-2xl font-semibold">Post a Crime</h1>
                <Divider className="mb-5 mt-3" />

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg font-semibold">
                    ⚠️ Error: {error}
                  </div>
                )}

                {/* Success Display */}
                {successMessage && (
                  <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-lg font-semibold">
                    ✅ {successMessage}
                  </div>
                )}

                <FormProvider {...methods}>
                  <form
                    onChange={clearMessages}
                    onSubmit={handleSubmit(onSubmit)}
                  >
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
                        <div className="relative dropdown-container">
                          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Division
                          </div>
                          <button
                            className="w-full px-3 py-2 text-left bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-primary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            disabled={divisionsLoading}
                            type="button"
                            onClick={() =>
                              setShowDivisionDropdown(!showDivisionDropdown)
                            }
                          >
                            <div className="flex justify-between items-center">
                              <span
                                className={
                                  divisionsLoading || !selectedDivision
                                    ? "text-gray-500"
                                    : "text-gray-900 dark:text-gray-100"
                                }
                              >
                                {divisionsLoading
                                  ? "Loading divisions..."
                                  : divisions.length === 0
                                    ? "No divisions available"
                                    : divisions.find(
                                        (div) => div.id === selectedDivision
                                      )?.name || "Select Division"}
                              </span>
                              <svg
                                className={`w-4 h-4 transition-transform ${showDivisionDropdown ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M19 9l-7 7-7-7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                            </div>
                          </button>
                          {showDivisionDropdown && divisions.length > 0 && (
                            <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in">
                              {divisions.map((division) => (
                                <button
                                  key={division.id}
                                  className="w-full px-3 py-2 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-brand-primary/10 dark:focus:bg-brand-primary/20 focus:outline-none transition-colors duration-200"
                                  type="button"
                                  onClick={() => {
                                    setSelectedDivision(division.id);
                                    setSelectedDistrict(""); // Reset district when division changes
                                    setShowDivisionDropdown(false);
                                  }}
                                >
                                  {division.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="min-w-fit flex-1">
                        <div className="relative dropdown-container">
                          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            District
                          </div>
                          <button
                            className="w-full px-3 py-2 text-left bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-primary/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedDivision}
                            type="button"
                            onClick={() =>
                              setShowDistrictDropdown(!showDistrictDropdown)
                            }
                          >
                            <div className="flex justify-between items-center">
                              <span
                                className={
                                  !selectedDivision || !selectedDistrict
                                    ? "text-gray-500"
                                    : "text-gray-900 dark:text-gray-100"
                                }
                              >
                                {!selectedDivision
                                  ? "Select Division First"
                                  : districts.find(
                                      (dist) => dist.id === selectedDistrict
                                    )?.name || "Select District"}
                              </span>
                              <svg
                                className={`w-4 h-4 transition-transform ${showDistrictDropdown ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M19 9l-7 7-7-7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                            </div>
                          </button>
                          {showDistrictDropdown &&
                            districts.length > 0 &&
                            selectedDivision && (
                              <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in">
                                {districts.map((district) => (
                                  <button
                                    key={district.id}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
                                    type="button"
                                    onClick={() => {
                                      setSelectedDistrict(district.id);
                                      setShowDistrictDropdown(false);
                                    }}
                                  >
                                    {district.name}
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
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

                    {/* Form Validation Status */}
                    {/* {!isFormValid() && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg
                              className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                clipRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                fillRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                              Please complete all required fields:
                            </p>
                            <ul className="mt-1 text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                              {!methods.watch("title") && (
                                <li>• Title is required</li>
                              )}
                              {!methods.watch("crimeDate") && (
                                <li>• Crime date is required</li>
                              )}
                              {!selectedDivision && (
                                <li>• Division selection is required</li>
                              )}
                              {!selectedDistrict && (
                                <li>• District selection is required</li>
                              )}
                              {imageFiles.length === 0 && (
                                <li>• At least one image is required</li>
                              )}
                              {!methods.watch("description") && (
                                <li>• Description is required</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )} */}

                    {/* Footer Buttons */}
                    <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        className="px-6 py-2 border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 font-medium transition-all duration-200"
                        size="lg"
                        variant="bordered"
                        onPress={onClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        className={`px-6 py-2 font-medium transition-all duration-200 ${
                          isFormValid()
                            ? "bg-brand-gradient text-white shadow-lg hover:shadow-xl hover:scale-105"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }`}
                        isDisabled={!isFormValid() || createPostPending}
                        isLoading={createPostPending}
                        size="lg"
                        type="submit"
                      >
                        {createPostPending ? "Posting..." : "Post Crime Report"}
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
