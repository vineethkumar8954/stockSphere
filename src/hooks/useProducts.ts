import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category_id?: string;
  supplier_id?: string;
  price: number;
  quantity: number;
  reorder_level: number;
  created_at: string;
  updated_at: string;
  categories?: { name: string };
  suppliers?: { name: string };
}

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => api.get<Product[]>("/products"),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string; sku: string; category_id?: string | null;
      supplier_id?: string | null; price: number; quantity: number; reorder_level: number;
    }) => api.post("/products", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: string; name?: string; sku?: string; category_id?: string | null;
      supplier_id?: string | null; price?: number; quantity?: number; reorder_level?: number;
    }) => api.put(`/products/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
