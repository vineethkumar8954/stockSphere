import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email }, false);
            setSent(true);
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
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

                {sent ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                    >
                        <div className="mx-auto w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-7 w-7 text-green-500" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-foreground mb-2">Check your inbox</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
                        </p>
                        <Link to="/login">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Return to Sign In
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        <h2 className="text-2xl font-display font-bold text-foreground mb-1">Forgot password?</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Enter your email and we'll send you a reset link.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="email">Email address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="youremail@example.com"
                                        className="pl-9"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Send Reset Link
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                                <ArrowLeft className="h-3 w-3" /> Back to Sign In
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
