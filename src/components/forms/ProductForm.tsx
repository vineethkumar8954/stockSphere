import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSuppliers } from "@/hooks/useSuppliers";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string; name: string; sku: string; category_id: string | null;
    supplier_id: string | null; price: number; quantity: number; reorder_level: number;
  } | null;
}

export function ProductForm({ open, onOpenChange, editData }: ProductFormProps) {
  const [form, setForm] = useState({
    name: "", sku: "", category_id: "", supplier_id: "", price: "0", quantity: "0", reorder_level: "10",
  });
  const { data: categories } = useCategories();
  const { data: suppliers } = useSuppliers();
  const create = useCreateProduct();
  const update = useUpdateProduct();

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name, sku: editData.sku,
        category_id: editData.category_id ?? "", supplier_id: editData.supplier_id ?? "",
        price: String(editData.price), quantity: String(editData.quantity),
        reorder_level: String(editData.reorder_level),
      });
    } else {
      setForm({ name: "", sku: "", category_id: "", supplier_id: "", price: "0", quantity: "0", reorder_level: "10" });
    }
  }, [editData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) return;
    const payload = {
      name: form.name.trim(), sku: form.sku.trim(),
      category_id: form.category_id || null, supplier_id: form.supplier_id || null,
      price: parseFloat(form.price) || 0, quantity: parseInt(form.quantity) || 0,
      reorder_level: parseInt(form.reorder_level) || 10,
    };
    if (editData) {
      update.mutate({ id: editData.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const inputClass = "w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{editData ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Name *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">SKU *</label>
              <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className={inputClass}>
                <option value="">None</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Supplier</label>
              <select value={form.supplier_id} onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))} className={inputClass}>
                <option value="">None</option>
                {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Price</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={`${inputClass} !mt-0 pl-7`} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Quantity</label>
              <input type="number" min="0" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Reorder Level</label>
              <input type="number" min="0" value={form.reorder_level} onChange={(e) => setForm((f) => ({ ...f, reorder_level: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={create.isPending || update.isPending} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {create.isPending || update.isPending ? "Saving..." : editData ? "Update" : "Create"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
