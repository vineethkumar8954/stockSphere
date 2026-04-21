import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useCategoriesWithCount, useDeleteCategory } from "@/hooks/useCategories";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, FolderOpen, Loader2 } from "lucide-react";

const Categories = () => {
  const { data: categories, isLoading } = useCategoriesWithCount();
  const deleteCategory = useDeleteCategory();
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">Organize your products into categories</p>
        </div>
        <button onClick={() => { setEditData(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity glow-primary">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((cat, i) => (
            <GlassCard key={cat.id} hover delay={0.1 + i * 0.05}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.productsCount} products</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditData(cat); setFormOpen(true); }}
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { if (confirm("Delete this category?")) deleteCategory.mutate(cat.id); }}
                    className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{cat.description || "No description"}</p>
            </GlassCard>
          ))}
          {categories?.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">No categories yet. Add your first one!</p>
          )}
        </div>
      )}

      <CategoryForm open={formOpen} onOpenChange={setFormOpen} editData={editData} />
    </div>
  );
};

export default Categories;
