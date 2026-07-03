import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface CustomerStore {
  customer: Customer | null;
  token: string | null;
  setCustomer: (customer: Customer, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customer: null,
      token: null,
      setCustomer: (customer, token) => set({ customer, token }),
      logout: () => set({ customer: null, token: null }),
      isAuthenticated: () => !!get().token && !!get().customer,
    }),
    {
      name: 'jodo-customer-auth',
    }
  )
);
