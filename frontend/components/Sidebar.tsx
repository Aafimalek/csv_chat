"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare, Plus, Trash2, Menu, X, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatSession {
    id: string;
    title: string;
    date: number;
    preview: string;
}

interface SidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
    onDeleteSession: (id: string, e: React.MouseEvent) => void;
    className?: string;
}

export function Sidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    className,
}: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r-2 border-sidebar-border">
            <div className={cn("p-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && (
                    <Button
                        onClick={onNewChat}
                        className="w-full justify-start gap-2 neo-border shadow-none"
                        variant="default"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex text-sidebar-foreground hover:bg-primary hover:text-primary-foreground ml-2"
                >
                    {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                </Button>
            </div>

            {isCollapsed && (
                <div className="px-2 mb-2 flex justify-center">
                    <Button
                        onClick={onNewChat}
                        size="icon"
                        variant="default"
                        className="neo-border shadow-none"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <ScrollArea className="flex-1 px-2">
                <div className="space-y-1 py-2">
                    <AnimatePresence>
                        {sessions.map((session, index) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "group flex items-center gap-2 rounded-none px-3 py-3 transition-colors hover:bg-primary/50 cursor-pointer text-sm",
                                    currentSessionId === session.id ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground/80",
                                    isCollapsed ? "justify-center" : ""
                                )}
                                onClick={() => onSelectSession(session.id)}
                            >
                                <MessageSquare className="w-4 h-4 shrink-0" />
                                {!isCollapsed && (
                                    <>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate">
                                                {session.title || "New Chat"}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground hover:text-destructive"
                                            onClick={(e) => onDeleteSession(session.id, e)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {sessions.length === 0 && !isCollapsed && (
                        <div className="text-center text-xs text-sidebar-foreground/50 py-4">
                            No history yet
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );

    if (isMobile) {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-50 neo-border bg-background">
                        <Menu className="w-5 h-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 border-r-2 border-sidebar-border bg-sidebar text-sidebar-foreground">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <motion.div
            animate={{ width: isCollapsed ? 60 : 260 }}
            className={cn("hidden md:block h-screen sticky top-0 z-40 bg-sidebar border-r-2 border-sidebar-border", className)}
        >
            <SidebarContent />
        </motion.div>
    );
}
