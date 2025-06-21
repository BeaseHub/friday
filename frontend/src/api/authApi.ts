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

// Signup (user)
export const signup = async (formData: FormData) => {
  try {
    const res = await axios.post(`${API_URL}/signup`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Signup response:', res);
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

// Admin create user
export const adminCreateUser = async (formData: FormData, token: string) => {
  try {
    const res = await axios.post(`${API_URL}/admin/create-user`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Login
export const login = async (email: string, password: string) => {
  try {
    const data = new URLSearchParams();
    data.append('username', email);
    data.append('password', password);
    const res = await axios.post(`${API_URL}/login`, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    console.log('Login response:', res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update profile
export const updateProfile = async (formData: FormData, token: string) => {
  try {
    const res = await axios.patch(`${API_URL}/update-profile`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Example usage in a component:
// try {
//   await signup(formData);
// } catch (err) {
//   alert(err.message); // or use err.status for custom handling
// }