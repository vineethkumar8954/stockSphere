import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { motion } from "framer-motion";
import { ArrowDownRight, Plus, Loader2 } from "lucide-react";

const Sales = () => {
  const { data: transactions, isLoading } = useTransactions("OUT");
  const [formOpen, setFormOpen] = useState(false);

  const totalQty = transactions?.reduce((sum, t) => sum + t.quantity, 0) ?? 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Sales</h1>
          <p className="text-muted-foreground text-sm mt-1">Track outgoing stock transactions</p>
        </div>
        <button onClick={() => setFormOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity glow-primary">
          <Plus className="h-4 w-4" /> Record Sale
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard hover delay={0.05}>
          <p className="text-sm text-muted-foreground">Total Sales Transactions</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{transactions?.length ?? 0}</p>
        </GlassCard>
        <GlassCard hover delay={0.1}>
          <p className="text-sm text-muted-foreground">Total Units Sold</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{totalQty}</p>
        </GlassCard>
      </div>

      <GlassCard delay={0.2}>
        <h3 className="font-display font-semibold text-foreground mb-4">Sales Transactions</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {transactions?.map((tx, i) => (
              <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.03 }}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20"><ArrowDownRight className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{(tx as any).products?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}{tx.notes ? ` • ${tx.notes}` : ""}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">-{tx.quantity} units</span>
              </motion.div>
            ))}
            {transactions?.length === 0 && <p className="text-center text-muted-foreground py-4">No sales recorded yet.</p>}
          </div>
        )}
      </GlassCard>

      <TransactionForm open={formOpen} onOpenChange={setFormOpen} defaultType="OUT" fixedType={true} />
    </div>
  );
};

export default Sales;
