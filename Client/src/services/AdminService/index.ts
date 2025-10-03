import axiosInstance from "@/src/libs/AxiosInstance";

export const getAdminStats = async () => {
  try {
    const { data } = await axiosInstance.get("/admin/stats");

    return data;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getDashboardOverview = async () => {
  try {
    const { data } = await axiosInstance.get("/admin/dashboard-overview");

    return data;
  } catch (error: any) {
    throw new Error(error);
  }
};
