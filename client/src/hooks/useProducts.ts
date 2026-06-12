import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products');
      return data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation<
    Product,
    Error,
    { productName: string; amountAvailable: number; cost: number }
  >({
    mutationFn: async (body) => {
      const { data } = await api.post<Product>('/products', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation<
    Product,
    Error,
    { id: string; data: Partial<{ productName: string; amountAvailable: number; cost: number }> }
  >({
    mutationFn: async ({ id, data }) => {
      const { data: updated } = await api.put<Product>(`/products/${id}`, data);
      return updated;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['products', id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
