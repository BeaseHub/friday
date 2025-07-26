import axios from 'axios';

// For Vite
const API_URL = import.meta.env.VITE_API_URL;

// Helper to handle errors
const handleApiError = (error: any) => {
  if ((error as any).isAxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.response?.data?.msg || error.message;
    throw { status, message };
  }
  throw { status: 500, message: 'Unknown error' };
};

// Get all active plans
export const getActivePlans = async () => {
  try {
    const res = await axios.get(`${API_URL}/plans/active`);
    console.log('Active plans response:', res);
    return res.data; // returns an array of plans
  } catch (error) {
    handleApiError(error);
  }
};

// Get a plan by ID
export const getPlanById = async (planId: number | string) => {
  try {
    const res = await axios.get(`${API_URL}/plans/${planId}`);
    console.log('Plan by ID response:', res);
    return res.data; // returns a single plan object
  } catch (error) {
    handleApiError(error);
  }
};