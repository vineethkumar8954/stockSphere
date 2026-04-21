import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductForm } from "@/components/forms/ProductForm";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { Search, Plus, Edit, Trash2, ArrowUpDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [txFormOpen, setTxFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const deleteProduct = useDeleteProduct();

  const getStatus = (p: { quantity: number; reorder_level: number }) =>
    p.quantity === 0 ? "Out of Stock" : p.quantity <= p.reorder_level ? "Low Stock" : "In Stock";

  const filtered = (products ?? []).filter((p) => {
    const status = getStatus(p);
    const catName = (p as any).categories?.name ?? "";
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || catName === categoryFilter;
    const matchStatus = statusFilter === "All" || status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your products and stock levels</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTxFormOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <ArrowUpDown className="h-4 w-4" /> Transaction
          </button>
          <button onClick={() => { setEditProduct(null); setProductFormOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity glow-primary">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </motion.div>

      <GlassCard delay={0.1}>
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="All">All Categories</option>
            {categories?.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="All">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </GlassCard>

      <GlassCard delay={0.2} className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Product</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">SKU</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Category</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Supplier</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Price</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Qty</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => {
                const status = getStatus(product);
                return (
                  <motion.tr key={product.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{product.name}</td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{product.sku}</td>
                    <td className="py-3 px-4 text-muted-foreground">{(product as any).categories?.name ?? "-"}</td>
                    <td className="py-3 px-4 text-muted-foreground">{(product as any).suppliers?.name ?? "-"}</td>
                    <td className="py-3 px-4 text-right text-foreground">₹{Number(product.price).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-foreground">{product.quantity}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status === "In Stock" ? "bg-accent/20 text-accent" :
                          status === "Low Stock" ? "bg-warning/20 text-warning" :
                            "bg-destructive/20 text-destructive"
                        }`}>{status}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setEditProduct(product); setProductFormOpen(true); }}
                          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => { if (confirm("Delete this product?")) deleteProduct.mutate(product.id); }}
                          className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No products found. Add your first product!</p>
        )}
      </GlassCard>

      <ProductForm open={productFormOpen} onOpenChange={setProductFormOpen} editData={editProduct} />
      <TransactionForm open={txFormOpen} onOpenChange={setTxFormOpen} />
    </div>
  );
};

export default Inventory;
