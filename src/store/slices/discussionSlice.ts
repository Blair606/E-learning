import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface DiscussionGroup {
  id: number;
  title: string;
  courseId: number;
  courseName: string;
  description: string;
  dueDate: string;
  groupNumber: number;
  totalGroups: number;
  members: {
    id: number;
    name: string;
  }[];
  messages: {
    id: number;
    userId: number;
    userName: string;
    content: string;
    timestamp: string;
  }[];
  lastActive: string;
}

interface DiscussionState {
  groups: DiscussionGroup[];
  loading: boolean;
  error: string | null;
}

const initialState: DiscussionState = {
  groups: [],
  loading: false,
  error: null,
};

// Async thunks
export const createDiscussionGroups = createAsyncThunk(
  'discussions/createGroups',
  async (groupData: {
    title: string;
    courseId: number;
    description: string;
    dueDate: string;
    numberOfGroups: number;
  }) => {
    const response = await axios.post('http://localhost/api/discussion_groups.php', groupData);
    return response.data;
  }
);

export const fetchDiscussionGroups = createAsyncThunk(
  'discussions/fetchGroups',
  async (courseId: number) => {
    const response = await axios.get(`http://localhost/E-learning/api/discussion_groups.php?course_id=${courseId}`);
    return response.data;
  }
);

const discussionSlice = createSlice({
  name: 'discussions',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{
      groupId: number;
      userId: number;
      userName: string;
      content: string;
    }>) => {
      const group = state.groups.find(g => g.id === action.payload.groupId);
      if (group) {
        group.messages.push({
          id: Date.now(),
          ...action.payload,
          timestamp: new Date().toISOString(),
        });
        group.lastActive = new Date().toISOString();
      }
    },
    updateGroupMembers: (state, action: PayloadAction<{
      groupId: number;
      members: { id: number; name: string; }[];
    }>) => {
      const group = state.groups.find(g => g.id === action.payload.groupId);
      if (group) {
        group.members = action.payload.members;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDiscussionGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDiscussionGroups.fulfilled, (state, action) => {
        state.loading = false;
        // The API will return the created groups, so we can update the state
        state.groups = [...state.groups, ...action.payload.groups];
      })
      .addCase(createDiscussionGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create discussion groups';
      })
      .addCase(fetchDiscussionGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscussionGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchDiscussionGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch discussion groups';
      });
  },
});

export const {
  addMessage,
  updateGroupMembers,
} = discussionSlice.actions;

export default discussionSlice.reducer; 