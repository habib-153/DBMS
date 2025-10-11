import { useQuery } from "@tanstack/react-query";

import {
  getAllDistricts,
  getAllDivisions,
  getDistrictStats,
  getDivisionStats,
  getHeatmapPoints,
  HeatmapFilters,
} from "@/src/services/HeatmapService";

export const useGetHeatmapPoints = (filters?: HeatmapFilters) => {
  return useQuery({
    queryKey: ["heatmapPoints", filters],
    queryFn: async () => await getHeatmapPoints(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetDistrictStats = (filters?: Partial<HeatmapFilters>) => {
  return useQuery({
    queryKey: ["districtStats", filters],
    queryFn: async () => await getDistrictStats(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetDivisionStats = (filters?: Partial<HeatmapFilters>) => {
  return useQuery({
    queryKey: ["divisionStats", filters],
    queryFn: async () => await getDivisionStats(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetAllDistricts = () => {
  return useQuery({
    queryKey: ["allDistricts"],
    queryFn: async () => await getAllDistricts(),
    staleTime: 60 * 60 * 1000, // 1 hour (rarely changes)
  });
};

export const useGetAllDivisions = () => {
  return useQuery({
    queryKey: ["allDivisions"],
    queryFn: async () => await getAllDivisions(),
    staleTime: 60 * 60 * 1000,
  });
};
