import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useProducts } from "@/hooks/useProducts";
import { useAudio } from "@/hooks/useAudio";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "IN" | "OUT";
  defaultProductId?: string;
  fixedType?: boolean;
}

export function TransactionForm({ open, onOpenChange, defaultType = "IN", defaultProductId, fixedType = false }: TransactionFormProps) {
  const [productId, setProductId] = useState(defaultProductId ?? "");
  const [type, setType] = useState<"IN" | "OUT">(defaultType);
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const { data: products } = useProducts();
  const create = useCreateTransaction();
  const { playSuccess } = useAudio();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !quantity) return;
    create.mutate(
      { product_id: productId, transaction_type: type, quantity: parseInt(quantity), notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          playSuccess();
          onOpenChange(false);
          setProductId(""); setQuantity("1"); setNotes("");
        },
      }
    );
  };

  const inputClass = "w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">
            {fixedType ? (type === "IN" ? "Record Purchase" : "Record Sale") : "Record Transaction"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!fixedType && (
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setType("IN")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === "IN" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}>
                  Stock In (Purchase)
                </button>
                <button type="button" onClick={() => setType("OUT")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === "OUT" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  Stock Out (Sale)
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground">Product *</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputClass} required>
              <option value="">Select product</option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.quantity} in stock)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Quantity *</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={2} />
          </div>
          <button type="submit" disabled={create.isPending} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {create.isPending ? "Recording..." : "Record Transaction"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
