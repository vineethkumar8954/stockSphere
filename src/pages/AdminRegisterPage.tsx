import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Mail, Lock, User, Building, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminRegisterPage() {
    const { registerAdmin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        company_name: "",
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await registerAdmin(form);
            toast.success("Company and Admin account created!");
            navigate("/");
        } catch (err: any) {
            toast.error(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background gradient blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-lg p-10 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-2xl shadow-2xl z-10"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 mb-4">
                        <Package className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Register Business</h1>
                    <p className="text-muted-foreground mt-2 max-w-xs">Create your company workspace and start managing inventory</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="company_name" className="text-sm font-medium ml-1">Company Name</Label>
                        <div className="relative group">
                            <Building className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input id="company_name" name="company_name" placeholder="e.g. Acme Corporation"
                                className="pl-11 h-12 bg-background/50 border-white/5 focus:border-primary/50 transition-all rounded-xl" required
                                value={form.company_name} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium ml-1">Full Name</Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input id="name" name="name" placeholder="John Doe"
                                    className="pl-11 h-12 bg-background/50 border-white/5 focus:border-primary/50 transition-all rounded-xl" required
                                    value={form.name} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium ml-1">Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input id="email" name="email" type="email" placeholder="admin@acme.com"
                                    className="pl-11 h-12 bg-background/50 border-white/5 focus:border-primary/50 transition-all rounded-xl" required
                                    value={form.email} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <Label htmlFor="password" className="text-sm font-medium ml-1">Password</Label>
                            {form.password && form.password.length < 6 && (
                                <span className="text-[10px] text-destructive animate-pulse font-medium mb-0.5">
                                    Min. 6 characters
                                </span>
                            )}
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input id="password" name="password" type="password" placeholder="••••••••"
                                className={`pl-11 h-12 bg-background/50 border-white/5 focus:border-primary/50 transition-all rounded-xl ${form.password && form.password.length < 6 ? 'border-destructive/30' : ''}`}
                                required value={form.password} onChange={handleChange} />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl text-md font-semibold mt-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        disabled={loading || form.password.length < 6}
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ArrowRight className="h-5 w-5 mr-2" />}
                        Initialize Workspace
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-sm text-muted-foreground">
                        Not a business owner?{" "}
                        <Link to="/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
                            Register as Customer
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
