import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Daifu } from '../types';
import { daifuApi } from '../services/api';

interface DaifuState {
  items: Daifu[];
  loading: boolean;
  error: string | null;
}

const initialState: DaifuState = {
  items: [],
  loading: false,
  error: null,
};

export const getDaifus = createAsyncThunk(
  'daifu/getDaifus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await daifuApi.getDaifus();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get daifus');
    }
  }
);

export const createDaifu = createAsyncThunk(
  'daifu/createDaifu',
  async (daifuData: any, { rejectWithValue }) => {
    try {
      const response = await daifuApi.createDaifu(daifuData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create daifu');
    }
  }
);

export const updateDaifu = createAsyncThunk(
  'daifu/updateDaifu',
  async ({ id, daifuData }: { id: number; daifuData: any }, { rejectWithValue }) => {
    try {
      const response = await daifuApi.updateDaifu(id, daifuData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update daifu');
    }
  }
);

export const deleteDaifu = createAsyncThunk(
  'daifu/deleteDaifu',
  async (id: number, { rejectWithValue }) => {
    try {
      await daifuApi.deleteDaifu(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete daifu');
    }
  }
);

const daifuSlice = createSlice({
  name: 'daifu',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Daifus
      .addCase(getDaifus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDaifus.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getDaifus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Daifu
      .addCase(createDaifu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDaifu.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createDaifu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Daifu
      .addCase(updateDaifu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDaifu.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(daifu => daifu.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateDaifu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Daifu
      .addCase(deleteDaifu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDaifu.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(daifu => daifu.id !== action.payload);
      })
      .addCase(deleteDaifu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = daifuSlice.actions;
export default daifuSlice.reducer;
