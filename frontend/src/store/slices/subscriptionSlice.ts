
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActivePlan {
  id: string;
  name: string;
  price: number;
  category: string;
  isActive: boolean;
  subscriptionEnd?: string;
}

interface SubscriptionState {
  selectedAgents: string[];
  activePlans: ActivePlan[];
  subscribed: boolean;
}

const initialState: SubscriptionState = {
  selectedAgents: [],
  activePlans: [],
  subscribed: false,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    addAgent: (state, action: PayloadAction<string>) => {
      if (!state.selectedAgents.includes(action.payload)) {
        state.selectedAgents.push(action.payload);
      }
    },
    removeAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgents = state.selectedAgents.filter(id => id !== action.payload);
    },
    clearSelectedAgents: (state) => {
      state.selectedAgents = [];
    },
    setActivePlans: (state, action: PayloadAction<ActivePlan[]>) => {
      state.activePlans = action.payload;
    },
    addActivePlan: (state, action: PayloadAction<ActivePlan>) => {
      const existingIndex = state.activePlans.findIndex(plan => plan.id === action.payload.id);
      if (existingIndex >= 0) {
        state.activePlans[existingIndex] = action.payload;
      } else {
        state.activePlans.push(action.payload);
      }
    },
    removeActivePlan: (state, action: PayloadAction<string>) => {
      state.activePlans = state.activePlans.filter(plan => plan.id !== action.payload);
    },
    setSubscribed: (state, action: PayloadAction<boolean>) => {
      state.subscribed = action.payload;
    },
  },
});

export const { 
  addAgent, 
  removeAgent, 
  clearSelectedAgents, 
  setActivePlans, 
  addActivePlan, 
  removeActivePlan, 
  setSubscribed 
} = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
