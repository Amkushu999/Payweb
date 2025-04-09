import { User, Transaction, PaymentMethod } from "@shared/schema";

export interface PaymentMethodOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  isAvailable: boolean;
  comingSoon?: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
}

export interface OrderSummary {
  items: OrderItem[];
  subtotal: number;
  taxes: number;
  total: number;
}

export interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: unknown;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => void;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}
