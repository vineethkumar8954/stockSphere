import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ShieldCheck, Users, Building2, Package, ArrowUpDown,
    TrendingUp, TrendingDown, LogOut, Loader2, RefreshCw,
    Search, ChevronDown, Store, Truck, Trash2, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/superadmin`;

function useSupAdminFetch<T>(endpoint: string, token: string | null) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${BASE}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
            setData(await res.json());
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [token]);
    return { data, loading, error, refresh: load };
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
            </div>
        </motion.div>
    );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    return (
        <Badge variant="outline" className={
            status === "active"
                ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20"
                : "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20"
        }>
            {status === "active" ? "Active" : "Unverified"}
        </Badge>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("super_admin_token");
    const adminEmail = localStorage.getItem("super_admin_email");

    const [tab, setTab] = useState<"users" | "suppliers" | "transactions">("users");
    const [search, setSearch] = useState("");

    // Redirect if no token
    useEffect(() => {
        if (!token) navigate("/super-admin/login");
    }, [token]);

    const overview = useSupAdminFetch<any>("/overview", token);
    const users = useSupAdminFetch<any[]>("/users", token);
    const suppliers = useSupAdminFetch<any[]>("/suppliers", token);
    const transactions = useSupAdminFetch<any[]>("/transactions", token);
    const [isResetting, setIsResetting] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("super_admin_token");
        localStorage.removeItem("super_admin_email");
        navigate("/super-admin/login");
    };

    const handleResetData = async () => {
        if (!confirm("⚠️ WARNING: This will permanently delete ALL customer companies, users, products, suppliers, and transactions from the platform. This action cannot be undone.\n\nAre you absolutely sure?")) return;

        setIsResetting(true);
        try {
            const res = await fetch(`${BASE}/reset`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reset data");

            toast.success(data.message);
            // Refresh all data
            overview.refresh();
            users.refresh();
            suppliers.refresh();
            transactions.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsResetting(false);
        }
    };

    const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const fmtTime = (d: string) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

    const s = search.toLowerCase();

    const filteredUsers = (users.data || []).filter(u =>
        u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.company_name.toLowerCase().includes(s)
    );
    const filteredSuppliers = (suppliers.data || []).filter(sup =>
        sup.supplier_name.toLowerCase().includes(s) || sup.company_name.toLowerCase().includes(s) || (sup.owner_name || "").toLowerCase().includes(s)
    );
    const filteredTxns = (transactions.data || []).filter(t =>
        t.product_name.toLowerCase().includes(s) || t.company_name.toLowerCase().includes(s) || (t.user_name || "").toLowerCase().includes(s)
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-card/80 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-violet-600 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-foreground text-sm">Super Admin Panel</h1>
                        <p className="text-[10px] text-muted-foreground">{adminEmail}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleResetData}
                        disabled={isResetting}
                        className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
                    >
                        {isResetting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
                        Reset All Data
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:bg-muted">
                        <LogOut className="h-4 w-4 mr-1" /> Logout
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Overview Stats */}
                {overview.loading ? (
                    <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard icon={Building2} label="Companies" value={overview.data?.companies ?? 0} color="bg-violet-600" />
                        <StatCard icon={Users} label="Total Users" value={overview.data?.users ?? 0} color="bg-blue-600" />
                        <StatCard icon={Package} label="Products" value={overview.data?.products ?? 0} color="bg-teal-600" />
                        <StatCard icon={Truck} label="Suppliers" value={overview.data?.suppliers ?? 0} color="bg-orange-500" />
                        <StatCard icon={ArrowUpDown} label="Transactions" value={overview.data?.transactions ?? 0} color="bg-rose-500" />
                    </div>
                )}

                {/* Tabs + Search */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="flex bg-muted rounded-xl p-1 gap-1">
                        {(["users", "suppliers", "transactions"] as const).map(t => (
                            <button key={t} onClick={() => { setTab(t); setSearch(""); }}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {/* ── USERS TAB ── */}
                {tab === "users" && (
                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    {["Name", "Email", "Company / Store", "Role", "Status", "Products", "Suppliers", "Txns"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.loading ? (
                                    <tr><td colSpan={9} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-violet-500" /></td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">No users found</td></tr>
                                ) : filteredUsers.map(u => (
                                    <tr key={u.user_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Store className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                                <span className="font-medium text-foreground truncate max-w-[140px]">{u.company_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="text-xs border-violet-400 text-violet-600">{u.role}</Badge>
                                        </td>
                                        <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                                        <td className="px-4 py-3 text-center font-mono text-xs">{u.product_count}</td>
                                        <td className="px-4 py-3 text-center font-mono text-xs">{u.supplier_count}</td>
                                        <td className="px-4 py-3 text-center font-mono text-xs">{u.transaction_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── SUPPLIERS TAB ── */}
                {tab === "suppliers" && (
                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    {["Supplier Name", "Email", "Phone", "Company / Store", "Owner"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.loading ? (
                                    <tr><td colSpan={6} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-violet-500" /></td></tr>
                                ) : filteredSuppliers.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No suppliers found</td></tr>
                                ) : filteredSuppliers.map(s => (
                                    <tr key={s.supplier_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">{s.supplier_name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.email || "—"}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.phone || "—"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Store className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                                <span className="font-medium text-foreground">{s.company_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.owner_name || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── TRANSACTIONS TAB ── */}
                {tab === "transactions" && (
                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    {["Type", "Product", "SKU", "Quantity", "Company / Store", "Owner", "Notes", "Date & Time"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.loading ? (
                                    <tr><td colSpan={8} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-violet-500" /></td></tr>
                                ) : filteredTxns.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No transactions found</td></tr>
                                ) : filteredTxns.map(t => (
                                    <tr key={t.transaction_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${t.transaction_type === "IN" ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
                                                {t.transaction_type === "IN" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                Stock {t.transaction_type}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-foreground">{t.product_name}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.sku}</td>
                                        <td className="px-4 py-3 font-bold text-center">{t.quantity}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Store className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                                <span className="font-medium text-foreground">{t.company_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{t.user_name || "—"}</td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-[140px] truncate">{t.notes || "—"}</td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">{fmtTime(t.transaction_date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
