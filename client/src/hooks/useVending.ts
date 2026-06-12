import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { BuyResult, User } from '../types';

export function useDeposit() {
  const qc = useQueryClient();
  return useMutation<{ deposit: number }, Error, number>({
    mutationFn: async (amount) => {
      const { data } = await api.post<{ deposit: number }>('/deposit', { amount });
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData<User>(['user', 'me'], (old) =>
        old ? { ...old, deposit: data.deposit } : old
      );
    },
  });
}

export function useBuy() {
  const qc = useQueryClient();
  return useMutation<BuyResult, Error, { productId: string; amount: number }>({
    mutationFn: async (body) => {
      const { data } = await api.post<BuyResult>('/buy', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useReset() {
  const qc = useQueryClient();
  return useMutation<{ deposit: number }, Error, void>({
    mutationFn: async () => {
      const { data } = await api.post<{ deposit: number }>('/reset');
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData<User>(['user', 'me'], (old) =>
        old ? { ...old, deposit: data.deposit } : old
      );
    },
  });
}
