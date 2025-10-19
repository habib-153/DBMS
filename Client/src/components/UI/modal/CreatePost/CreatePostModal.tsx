"use client";
import { Button, Divider, Modal, ModalContent } from "@heroui/react";
import React, {
  ChangeEvent,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import "@/src/styles/mapbox-geocoder-custom.css"; /* keep styling for suggestions / input visuals */
import "leaflet/dist/leaflet.css";
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { useRouter } from "next/navigation";

import CTDatePicker from "@/src/components/form/CTDatePicker";
import CTSelect from "@/src/components/form/CTSelect";
import FXInput from "@/src/components/form/FXInput";
import FXTextarea from "@/src/components/form/FXTextArea";
import generateImageDescription from "@/src/services/ImageDescription";
import { useCreatePost } from "@/src/hooks/post.hook";
import { useUser } from "@/src/context/user.provider";
import dateToISO from "@/src/utils/dateToISO";
import { IPost } from "@/src/types";
import { useGeolocation } from "@/src/hooks/geolocation.hook";

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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const searchTimerRef = useRef<number | null>(null);
  const [loadingMyLocation, setLoadingMyLocation] = useState(false);

  const { getUserLocation } = useGeolocation();

  // Handler for "Use My Location" button
  const handleUseMyLocation = async () => {
    setLoadingMyLocation(true);
    try {
      const location = await getUserLocation();

      if (location && mapRef.current && markerRef.current) {
        const { latitude, longitude } = location;

        setSelectedCoords({ latitude, longitude });
        markerRef.current.setLatLng([latitude, longitude]);
        mapRef.current.setView([latitude, longitude], 15);

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data.display_name) {
            const searchInput = document.getElementById(
              "gm-search-input"
            ) as HTMLInputElement;

            if (searchInput) {
              searchInput.value = data.display_name;
            }
          }
        } catch (e) {
          console.error("Failed to reverse geocode:", e);
        }
      }
    } catch (error) {
      console.error("Failed to get user location:", error);
      alert(
        "Could not get your location. Please ensure location permissions are enabled."
      );
    } finally {
      setLoadingMyLocation(false);
    }
  };

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

  // Initialize Leaflet map + Nominatim when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let L: any;

    const init = async () => {
      try {
        L = await import("leaflet");

        // ensure default icons are available (when bundlers break default paths)
        if (L && L.Icon && L.Icon.Default) {
          L.Icon.Default.mergeOptions({
            iconRetinaUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          });
        }

        if (!mapRef.current && mapContainerRef.current) {
          const map = L.map(mapContainerRef.current).setView(
            [23.8103, 90.4125],
            6
          );

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          mapRef.current = map;

          const marker = L.marker([23.8103, 90.4125], {
            draggable: true,
          }).addTo(map);

          markerRef.current = marker;

          marker.on("dragend", () => {
            const pos = marker.getLatLng();

            setSelectedCoords({ latitude: pos.lat, longitude: pos.lng });
          });

          map.on("click", (e: any) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            marker.setLatLng([lat, lng]);
            setSelectedCoords({ latitude: lat, longitude: lng });
          });

          // Nominatim autocomplete on input
          const input = document.getElementById(
            "gm-search-input"
          ) as HTMLInputElement | null;

          if (input) {
            const onInput = (evt: any) => {
              const q = input.value.trim();

              if (searchTimerRef.current) {
                window.clearTimeout(searchTimerRef.current);
              }
              if (!q) {
                setSuggestions([]);

                return;
              }
              searchTimerRef.current = window.setTimeout(async () => {
                try {
                  const resp = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=7&countrycodes=bd&q=${encodeURIComponent(
                      q
                    )}`
                  );
                  const data = await resp.json();

                  setSuggestions(data || []);
                } catch (e) {
                  setSuggestions([]);
                }
              }, 300);
            };

            input.addEventListener("input", onInput);
            // store handler to remove later
            (input as any).__nominatimHandler = onInput;
          }
        }
      } catch (err) {
        console.error("Failed to load Leaflet", err);
      }
    };

    init();

    return () => {
      try {
        if (searchTimerRef.current) {
          window.clearTimeout(searchTimerRef.current);
          searchTimerRef.current = null;
        }
        setSuggestions([]);
        const input = document.getElementById(
          "gm-search-input"
        ) as HTMLInputElement | null;

        if (input && (input as any).__nominatimHandler) {
          input.removeEventListener("input", (input as any).__nominatimHandler);
          delete (input as any).__nominatimHandler;
        }
        if (markerRef.current && markerRef.current.remove) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        if (mapRef.current && mapRef.current.remove) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {
        // ignore
      }
    };
  }, [isOpen]);

  const handleSuggestionClick = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 14);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    }
    setSelectedCoords({ latitude: lat, longitude: lon });
    setSuggestions([]);
    const input = document.getElementById(
      "gm-search-input"
    ) as HTMLInputElement | null;

    if (input) input.value = item.display_name || "";
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    }
  };

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
      formData.category &&
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
      category: data.category || undefined,
      postDate: new Date(),
      author: user!.id,
      division: selectedDivision,
      district: selectedDistrict,
      location: `${divisionName}, ${districtName}`,
      latitude: selectedCoords?.latitude,
      longitude: selectedCoords?.longitude,
    };

    // Append the data correctly
    formData.append("data", JSON.stringify(postData));

    if (imageFiles.length > 0) {
      formData.append("image", imageFiles[0]);
    }

    // Add video if selected
    if (videoFile) {
      formData.append("video", videoFile);
    }

    handleCreatePost(formData);
  };

  const handleVideoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file size (10MB limit for client-side check)
    if (file.size > 10 * 1024 * 1024) {
      setError("Video must be less than 10MB");

      return;
    }

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setError("Please upload a valid video file");

      return;
    }

    setVideoFile(file);
    const reader = new FileReader();

    reader.onloadend = () => {
      setVideoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

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
    setVideoFile(null);
    setVideoPreview(null);
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

                    {/* Map selector for exact coordinates */}
                    <div className="py-4">
                      <label
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        htmlFor="map"
                      >
                        Select exact location
                      </label>
                      {/* Hidden form control to associate the label with a control for accessibility/linting */}
                      <input
                        readOnly
                        aria-hidden="true"
                        className="sr-only"
                        id="map"
                        tabIndex={-1}
                        type="text"
                        value=""
                      />
                      {/* Google Maps search input - used by Places Autocomplete */}
                      <div className="mb-2 relative">
                        <input
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          id="gm-search-input"
                          placeholder="Search address, place, or location"
                          type="text"
                          onKeyDown={handleSearchKeyDown}
                        />
                        {suggestions.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[9999]">
                            {suggestions.map((s, idx) => (
                              <button
                                key={s.place_id || idx}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                                type="button"
                                onClick={() => handleSuggestionClick(s)}
                              >
                                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                  {s.display_name.split(",")[0]}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-300 truncate">
                                  {s.display_name}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Use My Location Button */}
                      <div className="mb-2">
                        <Button
                          className="w-full"
                          color="primary"
                          isLoading={loadingMyLocation}
                          size="sm"
                          startContent={!loadingMyLocation && <span>📍</span>}
                          type="button"
                          variant="flat"
                          onPress={handleUseMyLocation}
                        >
                          {loadingMyLocation
                            ? "Getting your location..."
                            : "Use My Current Location"}
                        </Button>
                      </div>

                      <div
                        ref={mapContainerRef}
                        className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                      />
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        {selectedCoords ? (
                          <>
                            Selected: <strong>Lat:</strong>{" "}
                            {selectedCoords.latitude.toFixed(6)},{" "}
                            <strong>Lng:</strong>{" "}
                            {selectedCoords.longitude.toFixed(6)}
                          </>
                        ) : (
                          <>
                            Click on the map or search an address to pick
                            coordinates.
                          </>
                        )}
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

                    {/* Crime Category Dropdown - using CTSelect (react-hook-form aware) */}
                    <div className="py-2">
                      <CTSelect
                        label="Crime Category"
                        name="category"
                        options={[
                          { key: "MURDER", label: "Murder", value: "MURDER" },
                          { key: "THEFT", label: "Theft", value: "THEFT" },
                          {
                            key: "PICKPOCKET",
                            label: "Pickpocket",
                            value: "PICKPOCKET",
                          },
                          {
                            key: "BURGLARY",
                            label: "Burglary",
                            value: "BURGLARY",
                          },
                          {
                            key: "DACOITY",
                            label: "Dacoity",
                            value: "DACOITY",
                          },
                          {
                            key: "ASSAULT",
                            label: "Assault",
                            value: "ASSAULT",
                          },
                          { key: "FRAUD", label: "Fraud", value: "FRAUD" },
                          {
                            key: "VANDALISM",
                            label: "Vandalism",
                            value: "VANDALISM",
                          },
                          {
                            key: "KIDNAPPING",
                            label: "Kidnapping",
                            value: "KIDNAPPING",
                          },
                          { key: "OTHERS", label: "Others", value: "OTHERS" },
                        ]}
                      />
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

                    {/* Video Upload Section (Optional) */}
                    <div className="flex flex-wrap gap-2 py-2">
                      <div className="min-w-fit flex-1">
                        <label
                          className="flex h-14 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-default-200 text-default-500 shadow-sm transition-all duration-100 hover:border-default-400"
                          htmlFor="video"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                            />
                          </svg>
                          Upload video (Optional - Max 10MB)
                        </label>
                        <input
                          accept="video/*"
                          className="hidden"
                          id="video"
                          type="file"
                          onChange={(e) => handleVideoChange(e)}
                        />
                      </div>
                      {videoFile && (
                        <button
                          className="px-4 py-2 text-red-500 hover:text-red-700 font-medium text-sm"
                          type="button"
                          onClick={() => {
                            setVideoFile(null);
                            setVideoPreview(null);
                          }}
                        >
                          Remove Video
                        </button>
                      )}
                    </div>

                    {videoPreview && (
                      <div className="my-5 p-4 border-2 border-dashed border-default-300 rounded-xl">
                        <video
                          controls
                          className="w-full max-h-64 rounded-lg"
                          src={videoPreview}
                        >
                          {/* Provide a captions track to satisfy accessibility/lint requirements.
                              If you have caption files, replace the empty src with a real VTT file URL.
                              Keeping an empty src here acts as a placeholder to remove the lint error. */}
                          <track
                            kind="captions"
                            label="English captions"
                            src=""
                            srcLang="en"
                          />
                        </video>
                        <p className="text-sm text-default-500 mt-2">
                          {videoFile?.name} (
                          {(videoFile!.size / (1024 * 1024)).toFixed(2)}MB)
                        </p>
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
                            ? "bg-brand-primary text-white shadow-lg hover:shadow-xl hover:scale-105"
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
