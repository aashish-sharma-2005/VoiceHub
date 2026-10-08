const API_URL = "http://localhost:3000/api/dashboard";

export const getDashboardData = async () => {
  const response = await fetch(API_URL);

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch dashboard data");
  }

  return data;
};