import { GlassCard } from "@/components/ui/GlassCard";
import { useProducts } from "@/hooks/useProducts";
import { useTransactions } from "@/hooks/useTransactions";
import { useSuppliersWithCount } from "@/hooks/useSuppliers";
import { useCategoriesWithCount } from "@/hooks/useCategories";
import { motion } from "framer-motion";
import { FileText, Package, Truck, ArrowUpDown, AlertTriangle, BarChart3, Loader2 } from "lucide-react";
import { useMemo } from "react";

const Reports = () => {
  const { data: products, isLoading: lp } = useProducts();
  const { data: transactions, isLoading: lt } = useTransactions();
  const { data: suppliers } = useSuppliersWithCount();
  const { data: categories } = useCategoriesWithCount();

  const stockValuation = useMemo(() => {
    if (!products) return 0;
    return products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    if (!products) return 0;
    return products.filter((p) => p.quantity <= p.reorder_level).length;
  }, [products]);

  const isLoading = lp || lt;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Inventory analytics and insights</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard hover delay={0.05}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20 text-primary"><Package className="h-4 w-4" /></div>
            <p className="text-sm text-muted-foreground">Stock Valuation</p>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">₹{stockValuation.toLocaleString()}</p>
        </GlassCard>
        <GlassCard hover delay={0.1}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/20 text-accent"><BarChart3 className="h-4 w-4" /></div>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{products?.length ?? 0}</p>
        </GlassCard>
        <GlassCard hover delay={0.15}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-warning/20 text-warning"><AlertTriangle className="h-4 w-4" /></div>
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{lowStockCount}</p>
        </GlassCard>
        <GlassCard hover delay={0.2}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-secondary text-muted-foreground"><ArrowUpDown className="h-4 w-4" /></div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{transactions?.length ?? 0}</p>
        </GlassCard>
      </div>

      {/* Inventory by Category */}
      <GlassCard delay={0.25}>
        <h3 className="font-display font-semibold text-foreground mb-4">Inventory by Category</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Category</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Products</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((c) => (
              <tr key={c.id} className="border-b border-border/50">
                <td className="py-2 px-3 text-foreground">{c.name}</td>
                <td className="py-2 px-3 text-right text-foreground">{c.productsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories?.length === 0 && <p className="text-center text-muted-foreground py-4">No categories yet</p>}
      </GlassCard>

      {/* Inventory by Supplier */}
      <GlassCard delay={0.3}>
        <h3 className="font-display font-semibold text-foreground mb-4">Inventory by Supplier</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Supplier</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Contact</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Products</th>
            </tr>
          </thead>
          <tbody>
            {suppliers?.map((s) => (
              <tr key={s.id} className="border-b border-border/50">
                <td className="py-2 px-3 text-foreground">{s.name}</td>
                <td className="py-2 px-3 text-muted-foreground">{s.contact_person || "-"}</td>
                <td className="py-2 px-3 text-right text-foreground">{s.productsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {suppliers?.length === 0 && <p className="text-center text-muted-foreground py-4">No suppliers yet</p>}
      </GlassCard>
    </div>
  );
};

export default Reports;
