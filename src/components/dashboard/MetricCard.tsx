import { GlassCard } from "@/components/ui/GlassCard";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export function MetricCard({ title, value, change, changeType = "neutral", icon: Icon, iconColor = "text-primary", delay = 0 }: MetricCardProps) {
  return (
    <GlassCard hover delay={delay}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-display font-bold text-foreground mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-2 font-medium ${
              changeType === "positive" ? "text-accent" : changeType === "negative" ? "text-destructive" : "text-muted-foreground"
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-secondary ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlassCard>
  );
}
