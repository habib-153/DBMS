import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getAdminStats, getDashboardOverview } from "../services/AdminService";
import axiosInstance from "../libs/AxiosInstance";

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

// Get all pending reports (admin only)
export const useGetPendingReports = () => {
  return useQuery({
    queryKey: ["pendingReports"],
    queryFn: async () => {
      const res = await axiosInstance.get("/posts/reports/pending");

      return res.data.data;
    },
  });
};

// Review report (approve or reject)
export const useReviewReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      action,
    }: {
      reportId: string;
      action: "APPROVE" | "REJECT";
    }) => {
      const res = await axiosInstance.patch(
        `/posts/reports/${reportId}/review`,
        { action }
      );

      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pendingReports"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to review report");
    },
  });
};
