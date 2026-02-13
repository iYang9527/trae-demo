import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FinancialData } from '../types';
import { reportApi } from '../services/api';

interface ReportState {
  financialData: FinancialData[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  financialData: [],
  loading: false,
  error: null,
};

export const getFinancialReport = createAsyncThunk(
  'reports/getFinancialReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportApi.getFinancialReport();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get financial report');
    }
  }
);

export const getBonusReport = createAsyncThunk(
  'reports/getBonusReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportApi.getBonusReport();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get bonus report');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Financial Report
      .addCase(getFinancialReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFinancialReport.fulfilled, (state, action) => {
        state.loading = false;
        state.financialData = action.payload;
      })
      .addCase(getFinancialReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Bonus Report
      .addCase(getBonusReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBonusReport.fulfilled, (state, action) => {
        state.loading = false;
        // Handle bonus report data if needed
      })
      .addCase(getBonusReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = reportSlice.actions;
export default reportSlice.reducer;
