import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { User, Shield, ShieldCheck } from "lucide-react";

const mockUsers = [
  { id: "1", name: "John Smith", email: "john@stocksphere.com", role: "Admin", status: "Active" },
  { id: "2", name: "Jane Doe", email: "jane@stocksphere.com", role: "Staff", status: "Active" },
  { id: "3", name: "Mike Johnson", email: "mike@stocksphere.com", role: "Staff", status: "Active" },
  { id: "4", name: "Sarah Williams", email: "sarah@stocksphere.com", role: "Staff", status: "Inactive" },
];

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage user accounts and roles</p>
      </motion.div>

      <GlassCard delay={0.1} className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">User</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">Role</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user, i) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{user.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-foreground">
                    {user.role === "Admin" ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    user.status === "Active" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                  }`}>
                    {user.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};

export default UsersPage;
