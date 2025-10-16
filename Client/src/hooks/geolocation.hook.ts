import { useState, useCallback } from "react";

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
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
   * Get user's location using browser Geolocation API
   * Requests permission and returns precise GPS coordinates
   */
  const getUserLocation = useCallback((): Promise<GeolocationData | null> => {
    return new Promise((resolve) => {
      setIsLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setIsLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
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
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  /**
   * Get approximate location from IP address
   * This works even if user denies GPS permission
   * Uses ipapi.co free tier (1000 requests/day)
   */
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

  /**
   * Get location with fallback strategy:
   * 1. Try GPS (most accurate)
   * 2. Fall back to IP-based location
   */
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
    isLoading,
    error,
  };
};
