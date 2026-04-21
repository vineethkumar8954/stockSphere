import { Package, IndianRupee, AlertTriangle, ArrowUpDown, TrendingUp, ShoppingBag, Loader2 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { useProducts } from "@/hooks/useProducts";
import { useTransactions } from "@/hooks/useTransactions";
import { useNotifications } from "@/hooks/useNotifications";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["hsl(239, 84%, 67%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

const Dashboard = () => {
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: allTransactions, isLoading: loadingTx } = useTransactions();
  const { data: notifications } = useNotifications();

  const metrics = useMemo(() => {
    if (!products) return null;
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);
    const lowStockItems = products.filter((p) => p.quantity <= p.reorder_level).length;
    const totalTransactions = allTransactions?.length ?? 0;
    const salesTx = allTransactions?.filter((t) => t.transaction_type === "OUT") ?? [];
    const totalSalesQty = salesTx.reduce((sum, t) => sum + t.quantity, 0);
    return { totalProducts, totalValue, lowStockItems, totalTransactions, totalSalesQty };
  }, [products, allTransactions]);

  const categoryData = useMemo(() => {
    if (!products) return [];
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = (p as any).categories?.name ?? "Uncategorized";
      counts[cat] = (counts[cat] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }));
  }, [products]);

  const lowStockProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => p.quantity <= p.reorder_level).slice(0, 5);
  }, [products]);

  const recentTx = useMemo(() => (allTransactions ?? []).slice(0, 5), [allTransactions]);

  const isLoading = loadingProducts || loadingTx;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your inventory overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard title="Total Products" value={String(metrics?.totalProducts ?? 0)} icon={Package} delay={0} />
        <MetricCard title="Total Value" value={`₹${(metrics?.totalValue ?? 0).toLocaleString()}`} icon={IndianRupee} iconColor="text-accent" delay={0.05} />
        <MetricCard title="Low Stock" value={String(metrics?.lowStockItems ?? 0)} change={metrics?.lowStockItems ? "Needs attention" : "All good"} changeType={metrics?.lowStockItems ? "negative" : "positive"} icon={AlertTriangle} iconColor="text-warning" delay={0.1} />
        <MetricCard title="Transactions" value={String(metrics?.totalTransactions ?? 0)} icon={ArrowUpDown} delay={0.15} />
        <MetricCard title="Units Sold" value={String(metrics?.totalSalesQty ?? 0)} icon={ShoppingBag} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard delay={0.3}>
          <h3 className="font-display font-semibold text-foreground mb-4">⚠️ Low Stock Alerts</h3>
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.quantity === 0 ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
                  }`}>{product.quantity} left</span>
              </div>
            ))}
            {lowStockProducts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">All stock levels healthy!</p>}
          </div>
        </GlassCard>

        <GlassCard delay={0.35}>
          <h3 className="font-display font-semibold text-foreground mb-4">Category Distribution</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 20%, 88%)", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: cat.fill }} />
                    <span className="text-xs text-muted-foreground">{cat.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Add products to see distribution</p>
          )}
        </GlassCard>

        <GlassCard delay={0.4}>
          <h3 className="font-display font-semibold text-foreground mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{(tx as any).products?.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tx.transaction_type === "IN" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                  }`}>{tx.transaction_type === "IN" ? "+" : "-"}{tx.quantity}</span>
              </div>
            ))}
            {recentTx.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
