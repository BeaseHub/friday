import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Agent } from '../slices/agentSlice';

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  started_at?: string;
  expire_at?: string;
  created_at?: string;
  updated_at?: string;
  agents?: Agent[];
}

interface SubscriptionState {
  subscriptions: Subscription[];
  activeSubscription: Subscription | null;
}

const initialState: SubscriptionState = {
  subscriptions: [],
  activeSubscription: null,
};

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.subscriptions = action.payload;
    },
    setActiveSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.activeSubscription = action.payload;
    },
    removeActiveSubscription: (state) => {
      state.activeSubscription = null;
    },
    addSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscriptions.push(action.payload);
    },
    removeSubscription: (state, action: PayloadAction<number>) => {
      state.subscriptions = state.subscriptions.filter(sub => sub.id !== action.payload);
    },
    clearSubscriptions: (state) => {
      state.subscriptions = [];
      state.activeSubscription = null;
    },
  },
});

export const {
  setSubscriptions,
  setActiveSubscription,
  removeActiveSubscription,
  addSubscription,
  removeSubscription,
  clearSubscriptions
} = subscriptionSlice.actions;
export default subscriptionSlice.reducer;