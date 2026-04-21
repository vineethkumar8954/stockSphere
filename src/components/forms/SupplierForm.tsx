import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";

interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: { id: string; name: string; contact_person: string | null; phone: string | null; email: string | null; address: string | null } | null;
}

export function SupplierForm({ open, onOpenChange, editData }: SupplierFormProps) {
  const [form, setForm] = useState({ name: "", contact_person: "", phone: "", email: "", address: "" });
  const create = useCreateSupplier();
  const update = useUpdateSupplier();

  useEffect(() => {
    if (editData) {
      setForm({ name: editData.name, contact_person: editData.contact_person ?? "", phone: editData.phone ?? "", email: editData.email ?? "", address: editData.address ?? "" });
    } else {
      setForm({ name: "", contact_person: "", phone: "", email: "", address: "" });
    }
  }, [editData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = { name: form.name.trim(), contact_person: form.contact_person.trim() || undefined, phone: form.phone.trim() || undefined, email: form.email.trim() || undefined, address: form.address.trim() || undefined };
    if (editData) {
      update.mutate({ id: editData.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">{editData ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Name *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Contact Person</label>
              <input value={form.contact_person} onChange={(e) => setForm((f) => ({ ...f, contact_person: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Phone</label>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Address</label>
            <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground" />
          </div>
          <button type="submit" disabled={create.isPending || update.isPending} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {create.isPending || update.isPending ? "Saving..." : editData ? "Update" : "Create"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
