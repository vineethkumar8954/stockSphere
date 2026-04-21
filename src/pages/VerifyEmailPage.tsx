import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const { verifyEmail, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    type Status = "verifying" | "success" | "error";
    const [status, setStatus] = useState<Status>("verifying");
    const [errorMsg, setErrorMsg] = useState("");

    // Prevent double invocation in React Strict Mode
    const hasAttempted = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMsg("Invalid or missing verification link.");
            return;
        }

        if (isAuthenticated) {
            navigate("/");
            return;
        }

        if (hasAttempted.current) return;
        hasAttempted.current = true;

        const handleVerification = async () => {
            try {
                await verifyEmail(token);
                setStatus("success");
                toast.success("Account successfully verified!");
                // Wait briefly so user sees success message
                setTimeout(() => navigate("/"), 2500);
            } catch (err: any) {
                setStatus("error");
                setErrorMsg(err.message || "Failed to verify email.");
            }
        };

        handleVerification();
    }, [token, verifyEmail, navigate, isAuthenticated]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-md p-10 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-2xl shadow-2xl text-center"
            >
                {status === "verifying" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                        <div className="h-16 w-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Verifying Email</h2>
                        <p className="text-muted-foreground">Please wait while we activate your account...</p>
                    </motion.div>
                )}

                {status === "success" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                        <div className="h-16 w-16 mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Verification Complete!</h2>
                        <p className="text-muted-foreground mb-6">Your account is active. Redirecting you to the dashboard...</p>
                        <Button onClick={() => navigate("/")} className="w-full">
                            Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </motion.div>
                )}

                {status === "error" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                        <div className="h-16 w-16 mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                            <XCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Verification Failed</h2>
                        <p className="text-muted-foreground mb-6">{errorMsg}</p>
                        <Link to="/login" className="w-full">
                            <Button variant="outline" className="w-full">
                                Return to Sign In
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
