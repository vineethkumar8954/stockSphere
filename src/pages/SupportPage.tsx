import { motion } from "framer-motion";
import { Mail, Phone, MessageCircle, User as UserIcon, LifeBuoy } from "lucide-react";

export default function SupportPage() {
    return (
        <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Support & Contact</h1>
                    <p className="text-muted-foreground mt-1">Get in touch with us for any assistance or inquiries.</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6 md:grid-cols-2"
            >
                {/* Contact Card */}
                <div className="p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-xl relative overflow-hidden group shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <LifeBuoy className="w-32 h-32" />
                    </div>

                    <h2 className="text-2xl font-display font-semibold mb-8 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-primary" />
                        </div>
                        Vineeth Kumar
                    </h2>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Mail className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Email Support</p>
                                <a href="mailto:vineethkumar0501@gmail.com" className="text-sm font-medium text-foreground hover:text-blue-500 transition-colors">
                                    vineethkumar0501@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Phone className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">WhatsApp</p>
                                <a href="https://wa.me/917207257125" target="_blank" rel="noreferrer" className="text-sm font-medium text-foreground hover:text-green-500 transition-colors">
                                    +91 7207257125
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                <MessageCircle className="h-5 w-5 text-cyan-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Telegram</p>
                                <a href="https://t.me/saivineeth353" target="_blank" rel="noreferrer" className="text-sm font-medium text-foreground hover:text-cyan-500 transition-colors">
                                    @saivineeth353
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info Box */}
                <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 flex flex-col justify-center items-center text-center shadow-sm">
                    <div className="h-16 w-16 mb-6 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                        <LifeBuoy className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-foreground mb-3">We're here to help!</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                        Whether you have a question about the platform, need help with your inventory, or want to report an issue, please reach out directly through any of the channels provided. Response times are usually within 24 hours.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
