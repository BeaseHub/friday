import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Message interface
export interface Message {
  id: number;
  content: string;
  is_systen: boolean;
  file_path: string | null;
  conversation_id: number;
  sent_at: string;
  conversation?: Conversation; // Optional, for denormalized data
}

// Conversation interface
export interface Conversation {
  id: number;
  user_id: number;
  created_at: string;
  messages: Message[];
}

interface ChatState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  loading: boolean;
}

const initialState: ChatState = {
  conversations: [],
  selectedConversation: null,
  loading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    setSelectedConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.selectedConversation = action.payload;
    },
    addMessageToConversation: (
      state,
      action: PayloadAction<{ conversationId: number; message: Message }>
    ) => {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.messages.push(message);
        // If this is the selected conversation, update it too
        if (state.selectedConversation && state.selectedConversation.id === conversationId) {
          state.selectedConversation.messages.push(message);
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearChat: (state) => {
      state.conversations = [];
      state.selectedConversation = null;
      state.loading = false;
    },
  },
});

export const {
  setConversations,
  setSelectedConversation,
  addMessageToConversation,
  setLoading,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;