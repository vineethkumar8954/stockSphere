import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: { id: string; name: string; description: string | null } | null;
}

export function CategoryForm({ open, onOpenChange, editData }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const create = useCreateCategory();
  const update = useUpdateCategory();

  useEffect(() => {
    if (editData) { setName(editData.name); setDescription(editData.description ?? ""); }
    else { setName(""); setDescription(""); }
  }, [editData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editData) {
      update.mutate({ id: editData.id, name: name.trim(), description: description.trim() || undefined }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate({ name: name.trim(), description: description.trim() || undefined }, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">{editData ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground" required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground" rows={3} />
          </div>
          <button type="submit" disabled={create.isPending || update.isPending} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {create.isPending || update.isPending ? "Saving..." : editData ? "Update" : "Create"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
