import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { User, Lock, Bell, Database, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  const { user } = useAuth();
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState(() => {
    return localStorage.getItem("lowStockAlerts") !== "false";
  });
  const [txnAlerts, setTxnAlerts] = useState(() => {
    return localStorage.getItem("txnAlerts") !== "false";
  });

  const toggleLowStock = () => {
    const next = !lowStockAlerts;
    setLowStockAlerts(next);
    localStorage.setItem("lowStockAlerts", String(next));
  };

  const toggleTxnAlerts = () => {
    const next = !txnAlerts;
    setTxnAlerts(next);
    localStorage.setItem("txnAlerts", String(next));
  };

  const handleUpdatePassword = async () => {
    setLoadingPwd(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Password updated successfully");
    setLoadingPwd(false);
  };

  const [resetting, setResetting] = useState(false);
  const handleResetData = async () => {
    if (!window.confirm("Are you sure you want to delete ALL inventory, sales, products, and categories for your store? This cannot be undone!")) return;

    setResetting(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/companies/reset", {});
      toast.success("Account data cleared successfully!");
      // reload to clear cached react-query data
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to reset data");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and system preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard hover delay={0.1}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/20 text-primary"><User className="h-5 w-5" /></div>
            <h3 className="font-display font-semibold text-foreground">Profile</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Full Name</label>
              <input readOnly disabled className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground opacity-70" value={user?.name || ""} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input readOnly disabled className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground opacity-70" value={user?.email || ""} />
            </div>
          </div>
        </GlassCard>

        <GlassCard hover delay={0.15}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-warning/20 text-warning"><Lock className="h-5 w-5" /></div>
            <h3 className="font-display font-semibold text-foreground">Security</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Current Password</label>
              <input type="password" className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">New Password</label>
              <input type="password" className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground" placeholder="••••••••" />
            </div>
            <Button onClick={handleUpdatePassword} disabled={loadingPwd} className="w-full mt-2">
              {loadingPwd && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </div>
        </GlassCard>

        <GlassCard hover delay={0.2}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-accent/20 text-accent"><Bell className="h-5 w-5" /></div>
            <h3 className="font-display font-semibold text-foreground">Notifications</h3>
          </div>
          <div className="space-y-4 mt-2">
            <label className="flex items-center justify-between cursor-pointer group" onClick={toggleLowStock}>
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">Low stock alerts</span>
              <div className={`h-6 w-11 rounded-full relative transition-colors ${lowStockAlerts ? 'bg-primary' : 'bg-muted border border-border'}`}>
                <div className={`h-4 w-4 rounded-full bg-primary-foreground absolute top-1 transition-all ${lowStockAlerts ? 'right-1' : 'left-1 bg-muted-foreground'}`} />
              </div>
            </label>
            <div className="h-px bg-border/50 w-full" />
            <label className="flex items-center justify-between cursor-pointer group" onClick={toggleTxnAlerts}>
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">Transaction notifications</span>
              <div className={`h-6 w-11 rounded-full relative transition-colors ${txnAlerts ? 'bg-primary' : 'bg-muted border border-border'}`}>
                <div className={`h-4 w-4 rounded-full bg-primary-foreground absolute top-1 transition-all ${txnAlerts ? 'right-1' : 'left-1 bg-muted-foreground'}`} />
              </div>
            </label>
          </div>
        </GlassCard>

        <GlassCard hover delay={0.25}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-secondary text-muted-foreground"><Database className="h-5 w-5" /></div>
            <h3 className="font-display font-semibold text-foreground">System</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Default Reorder Level</label>
              <input type="number" className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground" defaultValue="10" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Currency</label>
              <select
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                defaultValue="INR"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover delay={0.3} className="md:col-span-2 border-destructive/20 bg-destructive/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mt-1">Permanently delete all products, sales, purchases, and settings for your store.</p>
            </div>
            <Button onClick={handleResetData} disabled={resetting} variant="destructive">
              {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset All Store Data
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SettingsPage;
