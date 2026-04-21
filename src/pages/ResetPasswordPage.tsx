import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Invalid Reset Link</h2>
                    <p className="text-muted-foreground mb-4">This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password">
                        <Button variant="outline">Request a new link</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            toast.error("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await api.post("/auth/reset-password", { token, password }, false);
            setStatus("success");
        } catch (err: any) {
            setStatus("error");
            setErrorMsg(err.message || "Reset failed. The link may have expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md p-8 rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-xl text-foreground">StockSphere</h1>
                        <p className="text-xs text-muted-foreground">Inventory Management</p>
                    </div>
                </div>

                {status === "success" ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                        <div className="mx-auto w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-7 w-7 text-green-500" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-foreground mb-2">Password Reset!</h2>
                        <p className="text-sm text-muted-foreground mb-6">Your password has been updated. You can now sign in with your new password.</p>
                        <Button className="w-full" onClick={() => navigate("/login")}>Sign In</Button>
                    </motion.div>
                ) : status === "error" ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                        <div className="mx-auto w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="h-7 w-7 text-destructive" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-foreground mb-2">Reset Failed</h2>
                        <p className="text-sm text-muted-foreground mb-6">{errorMsg}</p>
                        <Link to="/forgot-password">
                            <Button variant="outline" className="w-full">Request a new link</Button>
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        <h2 className="text-2xl font-display font-bold text-foreground mb-1">Set new password</h2>
                        <p className="text-sm text-muted-foreground mb-6">Choose a strong password for your account.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between items-end">
                                    <Label htmlFor="password">New Password</Label>
                                    {password && password.length < 6 && (
                                        <span className="text-[10px] text-destructive animate-pulse font-medium">Min. 6 characters</span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
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
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="confirm">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirm"
                                        type={showPwd ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`pl-9 ${confirm && confirm !== password ? 'border-destructive/50' : ''}`}
                                        required
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                    />
                                </div>
                                {confirm && confirm !== password && (
                                    <p className="text-[11px] text-destructive">Passwords do not match</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || password.length < 6 || password !== confirm}
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Reset Password
                            </Button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}
