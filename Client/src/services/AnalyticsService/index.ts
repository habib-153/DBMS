import axiosInstance from '@/src/libs/AxiosInstance';

export const getDashboard = async () => {
  const { data } = await axiosInstance.get('/analytics/dashboard');
  return data;
};
