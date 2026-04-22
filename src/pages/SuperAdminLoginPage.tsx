import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SuperAdminLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setAuthError(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
            const res = await fetch(`${API_URL}/auth/super-admin-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");
            localStorage.setItem("super_admin_token", data.token);
            localStorage.setItem("super_admin_email", data.email);
            navigate("/super-admin");
        } catch (err: any) {
            setAuthError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md p-8 rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-11 w-11 rounded-xl bg-violet-600 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-xl text-foreground">Super Admin</h1>
                        <p className="text-xs text-muted-foreground">StockSphere Platform Control</p>
                    </div>
                </div>

                <h2 className="text-2xl font-display font-bold text-foreground mb-1">Platform Access</h2>
                <p className="text-sm text-muted-foreground mb-6">Restricted to authorized administrators only.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="sa-email">Admin Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="sa-email"
                                type="email"
                                placeholder="superadmin@stocksphere.com"
                                className="pl-9"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="sa-pwd">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="sa-pwd"
                                type={showPwd ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-9 pr-9"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button type="button" className="absolute right-3 top-2.5 text-muted-foreground" onClick={() => setShowPwd(!showPwd)}>
                                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {authError && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium flex items-start gap-1">
                                <span>⚠️</span> {authError}
                            </p>
                        )}
                    </div>

                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white" disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Access Platform
                    </Button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                        <button onClick={() => navigate("/login")} className="text-violet-600 font-medium hover:underline">
                            ← Back to User Login
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
