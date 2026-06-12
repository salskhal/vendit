import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { getToken, setToken, removeToken } from '../lib/auth';
import type { User, LoginResponse } from '../types';

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { data } = await api.get<User>('/user/me');
      return data;
    },
    enabled: !!getToken(),
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation<LoginResponse, Error, { username: string; password: string }>({
    mutationFn: async (creds) => {
      const { data } = await api.post<LoginResponse>('/auth/login', creds);
      return data;
    },
    onSuccess: (data) => {
      setToken(data.access_token);
      qc.setQueryData(['user', 'me'], data.user);
    },
  });
}

export function useRegister() {
  return useMutation<User, Error, { username: string; password: string; role: 'buyer' | 'seller' }>({
    mutationFn: async (body) => {
      const { data } = await api.post<User>('/user', body);
      return data;
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await api.post('/auth/logout');
      } catch {
        // token may already be invalid; proceed with local cleanup
      }
    },
    onSettled: () => {
      removeToken();
      qc.clear();
    },
  });
}

export function useLogoutAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout/all');
    },
    onSettled: () => {
      removeToken();
      qc.clear();
    },
  });
}
