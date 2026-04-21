import { GlassCard } from "@/components/ui/GlassCard";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useNotifications";
import { motion } from "framer-motion";
import { AlertTriangle, Info, XCircle, Loader2, CheckCheck } from "lucide-react";

const iconMap: Record<string, typeof AlertTriangle> = {
  warning: AlertTriangle,
  info: Info,
  danger: XCircle,
};

const colorMap: Record<string, string> = {
  warning: "text-warning bg-warning/20",
  info: "text-primary bg-primary/20",
  danger: "text-destructive bg-destructive/20",
};

const Notifications = () => {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">Stay updated on inventory alerts</p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {notifications?.map((notif, i) => {
            const Icon = iconMap[notif.type] ?? Info;
            const colors = colorMap[notif.type] ?? colorMap.info;
            return (
              <motion.div key={notif.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.03 }}>
                <GlassCard className={`flex items-center gap-4 ${!notif.read ? "border-l-2 border-l-primary" : ""}`}>
                  <div className={`p-2.5 rounded-xl ${colors}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(notif.created_at).toLocaleDateString()}</p>
                  </div>
                  {!notif.read ? (
                    <button onClick={() => markRead.mutate(notif.id)}
                      className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Mark as read">
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Read</span>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
          {notifications?.length === 0 && <p className="text-center text-muted-foreground py-8">No notifications yet.</p>}
        </div>
      )}
    </div>
  );
};

export default Notifications;
