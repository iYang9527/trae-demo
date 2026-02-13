import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import channelReducer from './channelSlice';
import orderReducer from './orderSlice';
import daifuReducer from './daifuSlice';
import reportReducer from './reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    channels: channelReducer,
    orders: orderReducer,
    daifu: daifuReducer,
    reports: reportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
