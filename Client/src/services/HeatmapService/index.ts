"use server";

import axiosInstance from "@/src/libs/AxiosInstance";

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  crimeDate: string;
  title: string;
  district: string;
  division: string;
}

export interface DistrictStats {
  district: string;
  division: string;
  crimeCount: number;
  recentCount: number;
  severity: number;
  lat?: number;
  lng?: number;
}

export interface DivisionStats {
  division: string;
  crimeCount: number;
  districts: number;
  severity: number;
}

export interface HeatmapFilters {
  startDate?: string;
  endDate?: string;
  districts?: string[];
  divisions?: string[];
  status?: "PENDING" | "APPROVED" | "REJECTED";
  minVerificationScore?: number;
}

export const getHeatmapPoints = async (
  filters?: HeatmapFilters
): Promise<any> => {
  try {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.districts)
      params.append("districts", filters.districts.join(","));
    if (filters?.divisions)
      params.append("divisions", filters.divisions.join(","));
    if (filters?.status) params.append("status", filters.status);
    if (filters?.minVerificationScore)
      params.append(
        "minVerificationScore",
        filters.minVerificationScore.toString()
      );

    const { data } = await axiosInstance.get(
      `/heatmap/points?${params.toString()}`
    );

    return data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch heatmap points"
    );
  }
};

export const getDistrictStats = async (
  filters?: Partial<HeatmapFilters>
): Promise<any> => {
  try {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.divisions)
      params.append("divisions", filters.divisions.join(","));

    const { data } = await axiosInstance.get(
      `/heatmap/districts?${params.toString()}`
    );

    return data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch district statistics"
    );
  }
};

export const getDivisionStats = async (
  filters?: Partial<HeatmapFilters>
): Promise<any> => {
  try {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const { data } = await axiosInstance.get(
      `/heatmap/divisions?${params.toString()}`
    );

    return data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch division statistics"
    );
  }
};

export const getAllDistricts = async (): Promise<any> => {
  try {
    const { data } = await axiosInstance.get("/heatmap/all-districts");

    return data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch districts"
    );
  }
};

export const getAllDivisions = async (): Promise<any> => {
  try {
    const { data } = await axiosInstance.get("/heatmap/all-divisions");

    return data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch divisions"
    );
  }
};
