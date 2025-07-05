import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Agent {
  id: string;
  eleven_labs_id: string; // Unique identifier for Eleven Labs agent
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

const agentSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<Agent[]>) => {
      state.agents = action.payload;
    },
    setFilteredAgents: (state, action: PayloadAction<Agent[]>) => {
      state.filteredAgents = action.payload;
    },
    setSelectedAgents: (state, action: PayloadAction<Agent[]>) => {
      state.selectedAgents = action.payload;
    },
    addSelectedAgent: (state, action: PayloadAction<Agent>) => {
        if (!state.selectedAgents.some(agent => agent.id === action.payload.id)) {
            state.selectedAgents.push(action.payload);
        }
    },
    removeSelectedAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgents = state.selectedAgents.filter(agent => agent.id !== action.payload);
    },

    clearAgents: (state) => {
      state.agents = [];
      state.selectedAgents = [];
    },
  },
});

export const { setAgents,setFilteredAgents, setSelectedAgents, addSelectedAgent, removeSelectedAgent, clearAgents } = agentSlice.actions;
export default agentSlice.reducer;