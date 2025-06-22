import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price?: number;
  feature_list?: any[];
  max_agents: number;
  is_active?: boolean;
  image_path?: string;
  created_at?: string;
  updated_at?: string;
}

interface PlanState {
  plans: Plan[];
  selectedPlan: Plan | null;
}

const initialState: PlanState = {
  plans: [],
  selectedPlan: null,
};

const planSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    setPlans: (state, action: PayloadAction<Plan[]>) => {
      state.plans = action.payload;
    },
    setSelectedPlan: (state, action: PayloadAction<Plan | null>) => {
      state.selectedPlan = action.payload;
    },
    clearPlans: (state) => {
      state.plans = [];
      state.selectedPlan = null;
    },
  },
});

export const { setPlans, setSelectedPlan, clearPlans } = planSlice.actions;
export default planSlice.reducer;