import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { toast } from "sonner";

interface NotificationContextType {
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: notifications, refetch } = useNotifications();
    const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Hidden audio element for the chime
        audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

        const interval = setInterval(() => {
            refetch();
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, [refetch]);

    useEffect(() => {
        if (notifications && notifications.length > 0) {
            const latest = notifications[0];
            const unread = notifications.filter(n => !n.read);

            if (unread.length > 0) {
                const newestUnread = unread[0];

                // If the newest unread is different from the last one we saw
                if (newestUnread.id !== lastNotificationId) {
                    setLastNotificationId(newestUnread.id);

                    // Trigger toast
                    toast(newestUnread.message, {
                        description: "New Inventory Alert",
                        action: {
                            label: "View",
                            onClick: () => window.location.href = "/notifications",
                        },
                    });

                    // Play sound
                    if (audioRef.current) {
                        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
                    }
                }
            }
        }
    }, [notifications, lastNotificationId]);

    const unreadCount = notifications?.filter(n => !n.read).length || 0;

    return (
        <NotificationContext.Provider value={{ unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotificationContext must be used within a NotificationProvider");
    }
    return context;
};
