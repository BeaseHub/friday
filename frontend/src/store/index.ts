
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import languageSlice from './slices/languageSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    subscription: subscriptionSlice,
    language: languageSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
