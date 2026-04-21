import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Mail, Lock, User, Eye, EyeOff, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function LoginPage() {
    const { login, registerCustomer } = useAuth();
    const navigate = useNavigate();

    type Mode = "login" | "register" | "success";
    const [mode, setMode] = useState<Mode>("login");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
    const [resendLoading, setResendLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        company_name: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const msg = await registerCustomer({
                email: form.email,
                name: form.name,
                password: form.password,
                company_name: form.company_name || undefined
            });
            toast.success("Verification link sent!");
            setMode("success");
        } catch (err: any) {
            toast.error(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setUnverifiedEmail(null);
        setAuthError(null);
        try {
            await login(form.email, form.password);
            toast.success("Welcome back!");
            navigate("/");
        } catch (err: any) {
            // 403 = email not verified
            if (err.status === 403 || err.message?.toLowerCase().includes("verify")) {
                setUnverifiedEmail(form.email);
            } else {
                setAuthError(err.message || "Invalid credentials");
                toast.error(err.message || "Invalid credentials");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!unverifiedEmail) return;
        setResendLoading(true);
        try {
            await api.post("/auth/resend-verification", { email: unverifiedEmail }, false);
            toast.success("Verification email sent! Check your inbox.");
            setUnverifiedEmail(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to resend");
        } finally {
            setResendLoading(false);
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

                <AnimatePresence mode="wait">
                    {mode === "success" ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center py-6"
                        >
                            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                <Mail className="h-6 w-6 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Check your email</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                We've sent a verification link to <span className="font-medium text-foreground">{form.email}</span>.
                                Please click the link to activate your account.
                            </p>
                            <Button variant="outline" className="w-full" onClick={() => setMode("login")}>
                                Return to Sign In
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="login-reg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <h2 className="text-2xl font-display font-bold text-foreground mb-1">
                                {mode === "login" ? "Welcome back" : "Customer Signup"}
                            </h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                {mode === "login" ? "Sign in to your account" : "Join a store and start purchasing"}
                            </p>

                            {/* Unverified email warning banner */}
                            {unverifiedEmail && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                                >
                                    <div className="flex items-start gap-3">
                                        <MailCheck className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Email not verified</p>
                                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Please check your inbox and click the verification link.</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="mt-3 w-full border-amber-300 text-amber-800 hover:bg-amber-100"
                                        disabled={resendLoading}
                                        onClick={handleResendVerification}
                                    >
                                        {resendLoading && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                                        Resend Verification Email
                                    </Button>
                                </motion.div>
                            )}

                            <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
                                {mode === "register" && (
                                    <>
                                        <div className="space-y-1">
                                            <Label htmlFor="name">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input id="name" name="name" placeholder="John Doe" className="pl-9" required
                                                    value={form.name} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="company_name">Store / Company Name</Label>
                                            <div className="relative">
                                                <Package className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input id="company_name" name="company_name" placeholder={form.name ? `${form.name}'s Store` : "My Store"} className="pl-9" required
                                                    value={form.company_name} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="email" name="email" type="email" placeholder="email@example.com" className="pl-9" required
                                            value={form.email} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-end">
                                        <Label htmlFor="password">Password</Label>
                                        {mode === "login" ? (
                                            <Link to="/forgot-password" className="text-[11px] text-primary hover:underline mb-0.5">
                                                Forgot password?
                                            </Link>
                                        ) : (
                                            form.password && form.password.length < 6 && (
                                                <span className="text-[10px] text-destructive animate-pulse font-medium mb-0.5">
                                                    Min. 6 characters
                                                </span>
                                            )
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="password" name="password" type={showPwd ? "text" : "password"} placeholder="••••••••"
                                            className={`pl-9 pr-9 ${form.password && form.password.length < 6 ? 'border-destructive/30 focus-visible:ring-destructive/20' : ''}`}
                                            required value={form.password} onChange={handleChange} />
                                        <button type="button" className="absolute right-3 top-2.5 text-muted-foreground"
                                            onClick={() => setShowPwd(!showPwd)}>
                                            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {authError && mode === "login" && (
                                        <p className="text-xs text-red-500 mt-1.5 font-medium flex items-start gap-1">
                                            <span>⚠️</span> {authError}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading || form.password.length < 6}
                                >
                                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    {mode === "login" ? "Sign In" : "Sign Up"}
                                </Button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {mode !== "success" && (
                    <div className="mt-6 flex flex-col items-center gap-3">
                        <p className="text-sm text-muted-foreground">
                            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                            <button onClick={() => setMode(mode === "login" ? "register" : "login")}
                                className="text-primary font-medium hover:underline">
                                {mode === "login" ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Super Admin Access Link */}
            <div className="absolute bottom-6 right-6">
                <button
                    onClick={() => navigate('/super-admin/login')}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ShieldCheck className="h-5 w-5" />
                    Super Admin
                </button>
            </div>
        </div>
    );
}
