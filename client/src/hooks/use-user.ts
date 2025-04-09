import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, LoginPayload, RegisterPayload } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export function useUser(userId?: number) {
  return useQuery({
    queryKey: ['/api/auth/user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await fetch(`/api/auth/user?userId=${userId}`);
      const data = await res.json();
      return data.user as User;
    },
    enabled: !!userId
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    }
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (userData: RegisterPayload) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      const data = await res.json();
      return data;
    }
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      // In a real app, we would call a logout endpoint
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    }
  });
}
