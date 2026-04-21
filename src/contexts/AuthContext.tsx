import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setToken, clearToken } from "@/lib/api";

interface User {
    id: string;
    name: string;
    email: string;
    role: "Admin" | "Customer";
    company_id: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    registerCustomer: (data: any) => Promise<string>;
    registerAdmin: (data: any) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (stored && token) {
            try { setUser(JSON.parse(stored)); } catch { }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post<{ token: string; user: User }>(
            "/auth/login",
            { email, password },
            false
        );
        setToken(res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        setUser(res.user);
    };

    const registerCustomer = async (data: any): Promise<string> => {
        const res = await api.post<{ message: string }>(
            "/auth/register-customer",
            data,
            false
        );
        return res.message;
    };

    const verifyEmail = async (token: string) => {
        const res = await api.post<{ token: string; user: User }>(
            "/auth/verify-email",
            { token },
            false
        );
        setToken(res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        setUser(res.user);
    };

    const registerAdmin = async (data: any) => {
        const res = await api.post<{ token: string; user: User }>(
            "/auth/register-admin",
            data,
            false
        );
        setToken(res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        setUser(res.user);
    };

    const logout = () => {
        clearToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            registerCustomer,
            registerAdmin,
            verifyEmail,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}

