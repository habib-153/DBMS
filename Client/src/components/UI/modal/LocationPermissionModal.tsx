"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const LocationPermissionModal: React.FC<
  LocationPermissionModalProps
> = ({ isOpen, onAccept, onDecline }) => {
  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      placement="center"
      onClose={onDecline}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <span>Enable Location Services</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-default-600">
              We&apos;d like to access your location to provide you with better
              safety features:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold">Geofence Warnings</p>
                  <p className="text-sm text-default-500">
                    Get alerts when you enter high-crime areas
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-xl">📊</span>
                <div>
                  <p className="font-semibold">Crime Analytics</p>
                  <p className="text-sm text-default-500">
                    See crime statistics relevant to your area
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-xl">🗺️</span>
                <div>
                  <p className="font-semibold">Location History</p>
                  <p className="text-sm text-default-500">
                    Track your movement through different zones
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-default-100 p-3 rounded-lg">
              <p className="text-xs text-default-600">
                <strong>Privacy:</strong> Your location data is encrypted and
                only used for safety features. You can disable location tracking
                anytime in settings.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onDecline}>
            Not Now
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            onPress={onAccept}
          >
            Enable Location
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
