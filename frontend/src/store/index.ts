
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import languageSlice from './slices/languageSlice';
import planSlice from './slices/planSlice';
import agentSlice from './slices/agentSlice';
import chatSlice from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    subscription: subscriptionSlice,
    language: languageSlice,
    plan: planSlice,
    agent: agentSlice,
    chat: chatSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
