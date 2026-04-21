import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Company {
    id: number;
    name: string;
}

export function useCompanies() {
    return useQuery({
        queryKey: ["companies"],
        queryFn: () => api.get<Company[]>("/companies", false),
    });
}
