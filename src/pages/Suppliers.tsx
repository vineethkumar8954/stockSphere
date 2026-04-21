import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useSuppliersWithCount, useDeleteSupplier } from "@/hooks/useSuppliers";
import { SupplierForm } from "@/components/forms/SupplierForm";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Truck, Mail, Phone, Loader2 } from "lucide-react";

const Suppliers = () => {
  const { data: suppliers, isLoading } = useSuppliersWithCount();
  const deleteSupplier = useDeleteSupplier();
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your supplier network</p>
        </div>
        <button onClick={() => { setEditData(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity glow-primary">
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers?.map((sup, i) => (
            <GlassCard key={sup.id} hover delay={0.1 + i * 0.05}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-accent/20">
                    <Truck className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{sup.name}</h3>
                    <p className="text-xs text-muted-foreground">{sup.contact_person || "No contact"}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditData(sup); setFormOpen(true); }}
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { if (confirm("Delete this supplier?")) deleteSupplier.mutate(sup.id); }}
                    className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {sup.email && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {sup.email}</div>}
                {sup.phone && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {sup.phone}</div>}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{sup.productsCount} products{sup.address ? ` • ${sup.address}` : ""}</span>
              </div>
            </GlassCard>
          ))}
          {suppliers?.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">No suppliers yet. Add your first one!</p>
          )}
        </div>
      )}

      <SupplierForm open={formOpen} onOpenChange={setFormOpen} editData={editData} />
    </div>
  );
};

export default Suppliers;
