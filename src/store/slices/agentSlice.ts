import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Agent {
  id: string;
  eleven_labs_id: string; // Unique identifier for Eleven Labs agent
  link: string;
  name: string;
  price: number;
  description?: string;
  feature_list?: any[];
  is_active?: boolean;
  image_path?: string;
  created_at?: string;
  updated_at?: string;
}

interface AgentState {
  agents: Agent[];
  filteredAgents: Agent[];
  selectedAgents: Agent[];
}

const initialState: AgentState = {
  agents: [],
  filteredAgents: [],
  selectedAgents: [],
};

// Helper function to ensure arrays
const ensureArray = (value: any): any[] => (Array.isArray(value) ? value : []);

const agentSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<Agent[]>) => {
      state.agents = ensureArray(action.payload);
    },
    setFilteredAgents: (state, action: PayloadAction<Agent[]>) => {
      state.filteredAgents = ensureArray(action.payload);
    },
    setSelectedAgents: (state, action: PayloadAction<Agent[]>) => {
      state.selectedAgents = ensureArray(action.payload);
    },
    addSelectedAgent: (state, action: PayloadAction<Agent>) => {
      state.selectedAgents = ensureArray(state.selectedAgents);
      if (
        !state.selectedAgents.some((agent) => agent.id === action.payload.id)
      ) {
        state.selectedAgents.push(action.payload);
      }
    },
    removeSelectedAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgents = ensureArray(state.selectedAgents).filter(
        (agent) => agent.id !== action.payload
      );
    },

    clearAgents: (state) => {
      state.agents = [];
      state.selectedAgents = [];
    },
  },
});

export const {
  setAgents,
  setFilteredAgents,
  setSelectedAgents,
  addSelectedAgent,
  removeSelectedAgent,
  clearAgents,
} = agentSlice.actions;
export default agentSlice.reducer;
