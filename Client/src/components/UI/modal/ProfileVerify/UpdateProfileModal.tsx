"use client";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { PressEvent } from "@react-types/shared";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import "@/src/styles/mapbox-geocoder-custom.css";
import "leaflet/dist/leaflet.css";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { Camera, X, Loader2 } from "lucide-react";

import { IUser } from "@/src/types";
import { useUpdateUser } from "@/src/hooks/user.hook";
import FXForm from "@/src/components/form/FXForm";
import FXInput from "@/src/components/form/FXInput";
import { useGeolocation } from "@/src/hooks/geolocation.hook";

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
      }
    } catch (error) {
      console.error("Failed to get user location:", error);
      alert("Could not get your location. Please ensure location permissions are enabled.");
    } finally {
      setLoadingMyLocation(false);
    }
  };

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

    const payload = {
      ...data,
      latitude: selectedCoords?.latitude,
      longitude: selectedCoords?.longitude,
    };

    formData.append("data", JSON.stringify(payload));
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

  // Initialize Leaflet map + Nominatim when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let L: any;

    const init = async () => {
      try {
        L = await import("leaflet");

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
            [user.latitude || 23.8103, user.longitude || 90.4125],
            user.latitude ? 12 : 6
          );

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          mapRef.current = map;

          const marker = L.marker(
            [user.latitude || 23.8103, user.longitude || 90.4125],
            { draggable: true }
          ).addTo(map);

          markerRef.current = marker;

          if (user.latitude && user.longitude) {
            setSelectedCoords({
              latitude: user.latitude,
              longitude: user.longitude,
            });
          }

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
  }, [isOpen, user.latitude, user.longitude]);

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
      scrollBehavior="outside"
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose: ((e: PressEvent) => void) | undefined) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">
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

                {/* Map selector */}
                <div className="py-4">
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    htmlFor="map-coords-input"
                  >
                    Set exact address (click map)
                  </label>
                  <input
                    readOnly
                    aria-hidden="true"
                    className="sr-only"
                    id="map-coords-input"
                    type="text"
                  />
                  <div className="mb-2">
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      id="gm-search-input"
                      placeholder="Search address, place, or location"
                      type="text"
                      onKeyDown={handleSearchKeyDown}
                    />
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
                      {loadingMyLocation ? "Getting your location..." : "Use My Current Location"}
                    </Button>
                  </div>
                  
                  {suggestions.length > 0 && (
                    <div className="mb-2">
                      <div className="max-h-56 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[9999]">
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
                    </div>
                  )}
                  <div
                    ref={mapContainerRef}
                    className="w-full h-56 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                    id="map-container"
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
                        Click on the map to pick coordinates for your address.
                      </>
                    )}
                  </div>
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
