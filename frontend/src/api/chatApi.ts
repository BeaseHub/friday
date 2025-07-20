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

// Get conversations by user
export const getConversationsByUser = async (userId: number, token: string) => {
  try {
    const res = await axios.get(`${API_URL}/users/${userId}/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data; // returns an array of conversations
  } catch (error) {
    handleApiError(error);
  }
};

// Create a message (with optional file)
export const createMessage = async (
  content: string,
  conversation_id: number,
  token: string,
  link: string,
  file?: File,
) => {
  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('link',link);
    if (conversation_id !== null && conversation_id !== undefined) {
        formData.append('conversation_id', conversation_id.toString());
    }
    if (file) {
      formData.append('file', file);
    }

    const res = await axios.post(
      `${API_URL}/messages`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error sending message:', JSON.stringify(error));
  }
};
