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

// Helper to get bearer token
const getAuthHeader = () => {
  const auth = localStorage.getItem('auth');
  if (!auth) return {};
  const token = JSON.parse(auth)?.user?.token;
  console.log('Auth token:', token);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Types
export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  started_at?: string;
  expire_at?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  agents?: Agent[];
}

export interface Agent {
  id: number;
  name: string;
  // Add other agent fields as needed
}

export interface SubscriptionCreate {
  plan_id: number;
  agent_ids: number[];
  started_at?: string;
  expire_at?: string;
  status?: string;
}

export interface SubscriptionUpdate {
  plan_id?: number;
  started_at?: string;
  expire_at?: string;
  status?: string;
}

export const getActiveSubscriptionsByUser = async () => {
  try {
    const userId = JSON.parse(localStorage.getItem('auth')).user.id;
    if (!userId) throw new Error('User ID not found in localStorage');
    const res = await axios.get<Subscription[]>(
      `${API_URL}/users/${userId}/subscriptions/active`,
      { headers: getAuthHeader() }
    );
    console.log('Active subscriptions by user response:', res);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const createSubscription = async (payload: SubscriptionCreate) => {
  try {
    const res = await axios.post<Subscription>(
      `${API_URL}/subscriptions`,
      payload,
      { headers: getAuthHeader() }
    );
    console.log('Create subscription response:', res);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateSubscription = async (id: number, payload: SubscriptionUpdate) => {
  try {
    const res = await axios.put<Subscription>(
      `${API_URL}/subscriptions/${id}`,
      payload,
      { headers: getAuthHeader() }
    );
    return res.data;
    } catch (error) {
    handleApiError(error);
    }
}