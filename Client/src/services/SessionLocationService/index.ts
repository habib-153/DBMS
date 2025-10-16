import axiosInstance from "@/src/libs/AxiosInstance";

interface UpdateSessionLocationPayload {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  country?: string;
  city?: string;
  address?: string;
}

interface RecordLocationPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  activity?: string;
}

export const SessionLocationService = {
  /**
   * Update the current session with location data
   */
  updateSessionLocation: async (
    payload: UpdateSessionLocationPayload
  ): Promise<void> => {
    try {
      await axiosInstance.patch("/sessions/update-location", payload);
    } catch (error) {
      console.error("Failed to update session location:", error);
      throw error;
    }
  },

  /**
   * Record user location in location history
   */
  recordUserLocation: async (payload: RecordLocationPayload): Promise<void> => {
    try {
      await axiosInstance.post("/geofence/location", payload);
    } catch (error) {
      console.error("Failed to record user location:", error);
      throw error;
    }
  },

  /**
   * Get user's location history
   */
  getUserLocationHistory: async (limit = 50) => {
    try {
      const { data } = await axiosInstance.get(
        `/geofence/location-history?limit=${limit}`
      );

      return data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active geofence zones
   */
  getActiveGeofenceZones: async () => {
    try {
      const { data } = await axiosInstance.get("/geofence/zones");

      return data.data;
    } catch (error) {
      throw error;
    }
  },
  /**
   * Admin: Trigger server-side geofence check for a given user and coordinates
   */
  testGeofenceCheck: async (payload: {
    userId: string;
    latitude: number;
    longitude: number;
  }) => {
    try {
      const { data } = await axiosInstance.post(
        "/geofence/test-check",
        payload
      );

      return data;
    } catch (error) {
      console.error("Failed to run geofence test-check:", error);
      throw error;
    }
  },
};
