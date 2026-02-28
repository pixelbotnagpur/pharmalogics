
'use client';

import { useState, useMemo } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X,
  ShieldCheck,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase,
  updateDocumentNonBlocking 
} from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import type { Notification, NotificationType } from '@/lib/types';
import Link from 'next/link';

interface NotificationBellProps {
  className?: string;
  variant?: 'light' | 'dark';
}

const TYPE_CONFIG: Record<NotificationType, { icon: any; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  warning: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  error: { icon: X, color: 'text-red-500', bg: 'bg-red-500/10' },
};

export function NotificationBell({ className, variant = 'light' }: NotificationBellProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [isOpen, setIsOpen] = useState(false);

  const notificationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [db, user]);

  const { data: notifications } = useCollection<Notification>(notificationsQuery);

  const unreadCount = useMemo(() => {
    return notifications?.filter(n => !n.read).length || 0;
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    if (!user) return;
    const notificationRef = doc(db, 'users', user.uid, 'notifications', id);
    updateDocumentNonBlocking(notificationRef, { read: true });
  };

  const handleMarkAllAsRead = () => {
    if (!user || !notifications) return;
    notifications.filter(n => !n.read).forEach(n => {
      handleMarkAsRead(n.id);
    });
  };

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative h-10 w-10 rounded-full transition-all duration-300",
            variant === 'light' ? "hover:bg-white/10 text-white" : "hover:bg-primary/5 text-primary",
            className
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent border-2 border-primary"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[320px] sm:w-[380px] p-0 rounded-2xl border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
      >
        <div className="p-6 bg-primary text-white space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg">Registry Alerts</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-[9px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 h-7"
              >
                Clear Unread
              </Button>
            )}
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Clinical Node Monitoring</p>
        </div>

        <ScrollArea className="max-h-[400px]" data-lenis-prevent>
          {notifications && notifications.length > 0 ? (
            <div className="divide-y divide-border/30">
              {notifications.map((n) => {
                const config = TYPE_CONFIG[n.type];
                const Icon = config.icon;
                return (
                  <DropdownMenuItem 
                    key={n.id}
                    className={cn(
                      "p-5 flex gap-4 cursor-pointer transition-colors focus:bg-muted/50",
                      !n.read && "bg-primary/5"
                    )}
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", config.bg, config.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-xs font-bold uppercase tracking-tight truncate", !n.read ? "text-primary" : "text-muted-foreground")}>
                          {n.title}
                        </p>
                        <span className="text-[8px] font-mono opacity-30 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-light leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      {n.link && (
                        <div className="pt-2">
                          <Link href={n.link} className="text-[9px] font-bold uppercase tracking-widest text-accent flex items-center gap-1 hover:underline">
                            Trace Node <ArrowRight className="h-2 w-2" />
                          </Link>
                        </div>
                      )}
                    </div>
                    {!n.read && (
                      <div className="h-1.5 w-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 px-8">
              <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto text-muted-foreground/30">
                <Activity className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registry Quiet</p>
                <p className="text-xs text-muted-foreground/60 font-light">No new clinical updates registered at this node.</p>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-center gap-2 opacity-40">
          <ShieldCheck className="h-3 w-3" />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Verified Secure Handshake</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
