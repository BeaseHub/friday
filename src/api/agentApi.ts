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

// Get all active agents
export const getActiveAgents = async () => {
  try {
    const res = await axios.get(`${API_URL}/agents/active`);
    console.log('Active agents response:', res);
    return res.data; // returns an array of agents
  } catch (error) {
    handleApiError(error);
  }
};


// Get a agent by ID
export const getAgentById = async (agentId: number | string) => {
  try {
    const res = await axios.get(`${API_URL}/agents/${agentId}`);
    console.log('agent by ID response:', res);
    return res.data; // returns a single agent object
  } catch (error) {
    handleApiError(error);
  }
};