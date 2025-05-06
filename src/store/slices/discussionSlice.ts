import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

export interface DiscussionGroup {
  id: number;
  title: string;
  courseId: number;
  courseName: string;
  description: string;
  dueDate: string;
  numberOfGroups: number;
  memberCount: number;
  topicCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionState {
  groups: DiscussionGroup[];
  loading: boolean;
  error: string | null;
}

export const initialState: DiscussionState = {
  groups: [],
  loading: false,
  error: null,
};

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Async thunks
export const createDiscussionGroups = createAsyncThunk<
  any,
  {
    title: string;
    courseId: number;
    description?: string;
    dueDate?: string;
    numberOfGroups?: number;
  },
  { state: RootState }
>(
  'discussions/createGroups',
  async (groupData) => {
    const response = await axios.post(
      'http://localhost/E-learning/api/discussion_groups.php',
      {
        name: groupData.title,
        course_id: groupData.courseId,
        description: groupData.description,
        due_date: groupData.dueDate,
        number_of_groups: groupData.numberOfGroups
      },
      getAuthHeaders()
    );
    return response.data;
  }
);

export const fetchDiscussionGroups = createAsyncThunk<
  DiscussionGroup[],
  number,
  { state: RootState }
>(
  'discussions/fetchGroups',
  async (courseId) => {
    const response = await axios.get(
      `http://localhost/E-learning/api/discussion_groups.php?course_id=${courseId}`,
      getAuthHeaders()
    );
    return response.data.data;
  }
);

const discussionSlice = createSlice({
  name: 'discussions',
  initialState,
  reducers: {
    resetDiscussions: (state) => {
      state.groups = [];
      state.loading = false;
      state.error = null;
    },
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
        if (action.payload.status === 'success') {
          state.groups = [...state.groups, action.payload.data];
        }
      })
      .addCase(createDiscussionGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create discussion group';
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

export const { resetDiscussions, addMessage, updateGroupMembers } = discussionSlice.actions;

// Selectors
export const selectDiscussions = (state: RootState) => state.discussions || initialState;
export const selectDiscussionGroups = (state: RootState) => state.discussions?.groups || [];
export const selectDiscussionsLoading = (state: RootState) => state.discussions?.loading || false;
export const selectDiscussionsError = (state: RootState) => state.discussions?.error || null;

export default discussionSlice.reducer; 