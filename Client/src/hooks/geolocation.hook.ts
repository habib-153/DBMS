import { useState, useCallback } from "react";

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  city?: string;
  country?: string;
}

interface IPLocationData {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  ipAddress: string;
}

export const useGeolocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Reverse geocode coordinates to get address, city, and country
   */
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      // Using Nominatim (OpenStreetMap) for free reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "Warden Crime Reporting App",
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();

      return {
        address: data.display_name || "",
        city:
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          "",
        country: data.address?.country || "",
      };
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      return null;
    }
  }, []);

  /**
   * Get user's location using browser Geolocation API
   * Requests permission and returns precise GPS coordinates with address
   */
  const getUserLocation = useCallback((): Promise<GeolocationData | null> => {
    return new Promise(async (resolve) => {
      setIsLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setIsLoading(false);
        resolve(null);

        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Get address via reverse geocoding
          const geocodeResult = await reverseGeocode(latitude, longitude);

          const locationData: GeolocationData = {
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            address: geocodeResult?.address,
            city: geocodeResult?.city,
            country: geocodeResult?.country,
          };

          setIsLoading(false);
          resolve(locationData);
        },
        (err) => {
          let errorMessage = "Unable to retrieve location";

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location permission denied";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }

          setError(errorMessage);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // Increased from 10s to 30s for better GPS lock
          maximumAge: 0,
        }
      );
    });
  }, [reverseGeocode]);

  const getIPLocation =
    useCallback(async (): Promise<IPLocationData | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("https://ipapi.co/json/", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch IP location");
        }

        const data = await response.json();

        const ipLocationData: IPLocationData = {
          country: data.country_name || "Unknown",
          city: data.city || "Unknown",
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          ipAddress: data.ip || "",
        };

        setIsLoading(false);

        return ipLocationData;
      } catch (err) {
        setError("Failed to get location from IP");
        setIsLoading(false);

        return null;
      }
    }, []);

  const getLocationWithFallback = useCallback(async (): Promise<{
    gpsLocation: GeolocationData | null;
    ipLocation: IPLocationData | null;
  }> => {
    // Try GPS first
    const gpsLocation = await getUserLocation();

    // Always get IP location for additional data (country, city)
    const ipLocation = await getIPLocation();

    return { gpsLocation, ipLocation };
  }, [getUserLocation, getIPLocation]);

  /**
   * Request location permission without actually getting location yet
   * Useful for showing permission dialog early
   */
  const requestLocationPermission = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(false);

        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { timeout: 5000 }
      );
    });
  }, []);

  return {
    getUserLocation,
    getIPLocation,
    getLocationWithFallback,
    requestLocationPermission,
    reverseGeocode,
    isLoading,
    error,
  };
};
