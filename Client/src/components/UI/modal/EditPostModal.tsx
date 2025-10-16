"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { Image as ImageIcon, X, ChevronDown } from "lucide-react";
import Image from "next/image";

import { IPost } from "@/src/types/post.types";
import CTDatePicker from "@/src/components/form/CTDatePicker";
import FXForm from "@/src/components/form/FXForm";
import FXInput from "@/src/components/form/FXInput";
import FXTextArea from "@/src/components/form/FXTextArea";
import dateToISO from "@/src/utils/dateToISO";

interface EditPostModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  post: IPost;
  onSubmit: (data: FormData) => void;
  isUpdating: boolean;
}

export default function EditPostModal({
  isOpen,
  onOpenChange,
  post,
  onSubmit,
  isUpdating,
}: EditPostModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    post.image || null
  );
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedDivision, setSelectedDivision] = useState(post.division || "");
  const [selectedDistrict, setSelectedDistrict] = useState(post.district || "");
  const [divisionsLoading, setDivisionsLoading] = useState(false);
  const [showDivisionDropdown, setShowDivisionDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setImagePreview(post.image || null);
    setSelectedDivision(post.division || "");
    setSelectedDistrict(post.district || "");
  }, [post]);

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
  }, [isOpen, divisions.length, divisionsLoading]);

  // Load districts when division changes
  useEffect(() => {
    if (selectedDivision) {
      fetch(`https://bdapi.vercel.app/api/v.1/district/${selectedDivision}`)
        .then((response) => response.json())
        .then((data) => setDistricts(data.data))
        .catch(() => {
          setError("Failed to load districts");
          setDistricts([]);
        });
    }
  }, [selectedDivision]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (target.closest(".dropdown-container")) return;

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (data: any) => {
    // Validation
    if (!selectedDivision || !selectedDistrict) {
      setError("Please select both division and district");

      return;
    }

    const formData = new FormData();

    const divisionName =
      divisions.find((div) => div.id === selectedDivision)?.name || "";
    const districtName =
      districts.find((dist) => dist.id === selectedDistrict)?.name || "";

    // Prepare post data object matching CreatePost format
    const postData = {
      title: data.title,
      description: data.description,
      location: `${divisionName}, ${districtName}`,
      division: selectedDivision,
      district: selectedDistrict,
      crimeDate: dateToISO(data.crimeDate),
    };

    // Wrap data in JSON string like CreatePostModal does
    formData.append("data", JSON.stringify(postData));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    onSubmit(formData);
  };

  // Convert JS Date to DatePicker format
  const convertToDatePickerFormat = (dateValue: Date | string | undefined) => {
    if (!dateValue) return undefined;

    const date = new Date(dateValue);

    return {
      calendar: { identifier: "gregory" },
      day: date.getDate(),
      era: "AD",
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      // include time parts so the DatePicker can prefill time fields
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
  };

  const defaultValues = {
    title: post.title || "",
    description: post.description || "",
    crimeDate: convertToDatePickerFormat(post.crimeDate),
  };

  return (
    <Modal
      isDismissable={!isUpdating}
      isKeyboardDismissDisabled={isUpdating}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span className="text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                Edit Post
              </span>
            </ModalHeader>
            <ModalBody>
              <FXForm defaultValues={defaultValues} onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {error && (
                    <div className="p-3 bg-danger/10 border border-danger rounded-lg">
                      <p className="text-danger text-sm">{error}</p>
                    </div>
                  )}

                  {/* Title */}
                  <FXInput isRequired label="Title" name="title" />

                  {/* Description */}
                  <FXTextArea label="Description" name="description" />

                  {/* Division Dropdown */}
                  <div className="dropdown-container relative">
                    <p className="block text-sm font-medium mb-2">
                      Division <span className="text-danger">*</span>
                    </p>
                    <button
                      className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-700 rounded-lg hover:border-brand-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors"
                      type="button"
                      onClick={() => {
                        setShowDivisionDropdown(!showDivisionDropdown);
                        setShowDistrictDropdown(false);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={
                            selectedDivision
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-500"
                          }
                        >
                          {divisions.find((d) => d.id === selectedDivision)
                            ?.name || "Select Division"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                    {showDivisionDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {divisions.map((division) => (
                          <button
                            key={division.id}
                            className="w-full px-4 py-2 text-left hover:bg-brand-primary/10 transition-colors"
                            type="button"
                            onClick={() => {
                              setSelectedDivision(division.id);
                              setSelectedDistrict("");
                              setDistricts([]);
                              setShowDivisionDropdown(false);
                              if (error) setError("");
                            }}
                          >
                            {division.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* District Dropdown */}
                  <div className="dropdown-container relative">
                    <p className="block text-sm font-medium mb-2">
                      District <span className="text-danger">*</span>
                    </p>
                    <button
                      className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-700 rounded-lg hover:border-brand-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!selectedDivision || districts.length === 0}
                      type="button"
                      onClick={() => {
                        setShowDistrictDropdown(!showDistrictDropdown);
                        setShowDivisionDropdown(false);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={
                            selectedDistrict
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-500"
                          }
                        >
                          {districts.find((d) => d.id === selectedDistrict)
                            ?.name || "Select District"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                    {showDistrictDropdown && selectedDivision && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {districts.map((district) => (
                          <button
                            key={district.id}
                            className="w-full px-4 py-2 text-left hover:bg-brand-primary/10 transition-colors"
                            type="button"
                            onClick={() => {
                              setSelectedDistrict(district.id);
                              setShowDistrictDropdown(false);
                              if (error) setError("");
                            }}
                          >
                            {district.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Crime Date */}
                  <div>
                    <p className="block text-sm font-medium mb-2">
                      Crime Date <span className="text-danger">*</span>
                    </p>
                    <CTDatePicker label="Select crime date" name="crimeDate" />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <p className="block text-sm font-medium mb-2">Post Image</p>
                    {imagePreview ? (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <Image
                          fill
                          alt="Post preview"
                          className="object-cover"
                          src={imagePreview}
                        />
                        <Button
                          isIconOnly
                          className="absolute top-2 right-2 bg-danger text-white"
                          size="sm"
                          type="button"
                          onPress={handleRemoveImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        htmlFor="image-upload"
                      >
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Click to upload image
                        </span>
                        <input
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                          type="file"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>

                  <ModalFooter className="px-0 pb-0">
                    <Button
                      isDisabled={isUpdating}
                      variant="light"
                      onPress={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-brand-primary text-white"
                      isLoading={isUpdating}
                      type="submit"
                    >
                      Update Post
                    </Button>
                  </ModalFooter>
                </div>
              </FXForm>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
