import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Channel } from '../types';
import { channelApi } from '../services/api';

interface ChannelState {
  items: Channel[];
  loading: boolean;
  error: string | null;
}

const initialState: ChannelState = {
  items: [],
  loading: false,
  error: null,
};

export const getChannels = createAsyncThunk(
  'channels/getChannels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await channelApi.getChannels();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get channels');
    }
  }
);

export const createChannel = createAsyncThunk(
  'channels/createChannel',
  async (channelData: any, { rejectWithValue }) => {
    try {
      const response = await channelApi.createChannel(channelData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create channel');
    }
  }
);

export const updateChannel = createAsyncThunk(
  'channels/updateChannel',
  async ({ id, channelData }: { id: number; channelData: any }, { rejectWithValue }) => {
    try {
      const response = await channelApi.updateChannel(id, channelData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update channel');
    }
  }
);

export const deleteChannel = createAsyncThunk(
  'channels/deleteChannel',
  async (id: number, { rejectWithValue }) => {
    try {
      await channelApi.deleteChannel(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete channel');
    }
  }
);

const channelSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Channels
      .addCase(getChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Channel
      .addCase(createChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChannel.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Channel
      .addCase(updateChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChannel.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(channel => channel.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Channel
      .addCase(deleteChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChannel.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(channel => channel.id !== action.payload);
      })
      .addCase(deleteChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = channelSlice.actions;
export default channelSlice.reducer;
