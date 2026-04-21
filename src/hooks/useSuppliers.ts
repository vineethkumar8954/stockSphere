import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export function useSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: () => api.get<Supplier[]>("/suppliers"),
  });
}

export function useSuppliersWithCount() {
  return useQuery({
    queryKey: ["suppliers-with-count"],
    queryFn: async () => {
      const [suppliers, products] = await Promise.all([
        api.get<Supplier[]>("/suppliers"),
        api.get<{ id: string; supplier_id: string }[]>("/products"),
      ]);
      return suppliers.map((s) => ({
        ...s,
        productsCount: products.filter((p) => p.supplier_id === s.id).length,
      }));
    },
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; contact_person?: string; phone?: string; email?: string; address?: string }) =>
      api.post("/suppliers", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["suppliers-with-count"] });
      toast.success("Supplier created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; contact_person?: string; phone?: string; email?: string; address?: string }) =>
      api.put(`/suppliers/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["suppliers-with-count"] });
      toast.success("Supplier updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["suppliers-with-count"] });
      toast.success("Supplier deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
