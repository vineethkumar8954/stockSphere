import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export interface Transaction {
  id: string;
  product_id: string;
  transaction_type: "IN" | "OUT";
  quantity: number;
  notes?: string;
  created_at: string;
  products?: { name: string; sku: string };
}

export function useTransactions(type?: "IN" | "OUT") {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", type],
    queryFn: () =>
      api.get<Transaction[]>(`/transactions${type ? `?type=${type}` : ""}`),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      product_id: string;
      transaction_type: "IN" | "OUT";
      quantity: number;
      notes?: string;
    }) => api.post("/transactions", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transactions", "IN"] });
      qc.invalidateQueries({ queryKey: ["transactions", "OUT"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Transaction recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
