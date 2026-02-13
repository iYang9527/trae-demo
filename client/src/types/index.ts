// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Channel types
export interface Channel {
  id: number;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface Order {
  id: number;
  orderNumber: string;
  amount: number;
  status: string;
  userId: number;
  channelId: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  channel?: Channel;
}

// Daifu types
export interface Daifu {
  id: number;
  orderId: number;
  amount: number;
  status: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
  createdAt: string;
  updatedAt: string;
  order?: Order;
}

// Report types
export interface Report {
  id: number;
  type: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialData {
  date: string;
  amount: number;
  type: string;
}

// Bonus types
export interface Bonus {
  id: number;
  userId: number;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// RootState type for Redux
export interface RootState {
  auth: AuthState;
  users: {
    items: User[];
    loading: boolean;
    error: string | null;
  };
  channels: {
    items: Channel[];
    loading: boolean;
    error: string | null;
  };
  orders: {
    items: Order[];
    loading: boolean;
    error: string | null;
  };
  daifu: {
    items: Daifu[];
    loading: boolean;
    error: string | null;
  };
  reports: {
    financialData: FinancialData[];
    loading: boolean;
    error: string | null;
  };
}
