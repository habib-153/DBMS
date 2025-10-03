import { useQuery } from "@tanstack/react-query";

import { getAdminStats, getDashboardOverview } from "../services/AdminService";

export const useGetAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => await getAdminStats(),
    refetchInterval: 5000,
  });
};

export const useGetDashboardOverview = () => {
  return useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: async () => await getDashboardOverview(),
    refetchInterval: 10000,
  });
};
