import { useCallback } from 'react';

export function useAudio() {
    const playSuccess = useCallback(() => {
        try {
            const isTxnAlertsEnabled = localStorage.getItem("txnAlerts") !== "false";
            if (!isTxnAlertsEnabled) return;

            // Create a short satisfying "ding" sound
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;

            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            // Pitch goes up slightly
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6

            // Volume envelope (quick attack, satisfying decay)
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05); // Attack
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3); // Decay

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
            console.error("Audio playback failed:", e);
        }
    }, []);

    return { playSuccess };
}
