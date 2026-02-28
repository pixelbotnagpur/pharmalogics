"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  Repeat, 
  User, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface AccountSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; initials: string };
  onLogout: () => void;
}

const navItems = [
  { href: "/dashboard", label: "My Account", icon: LayoutDashboard, desc: "Overview & Protocol" },
  { href: "/dashboard/orders", label: "Orders", icon: Package, desc: "Logistics History" },
  { href: "/dashboard/subscriptions", label: "Subscriptions", icon: Repeat, desc: "Recurring Formulas" },
  { href: "/dashboard/profile", label: "Profile", icon: User, desc: "User Configuration" },
  { href: "/dashboard/progress", label: "My Progress", icon: Activity, desc: "Optimization Trends" },
];

export function AccountSheet({ isOpen, onClose, user, onLogout }: AccountSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
          animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
          exit={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "z-40 bg-background border-none shadow-2xl overflow-hidden flex flex-col h-auto max-h-[85vh]",
            "fixed top-16 right-0 left-0 md:left-auto md:right-4 w-full md:w-[340px] rounded-b-xl"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-8 bg-white border-b text-left">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-headline text-lg shrink-0">
                {user.initials}
              </div>
              <div className="min-w-0">
                <h3 className="font-headline text-xl leading-tight truncate">{user.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="h-3 w-3 text-primary shrink-0" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground truncate">Verified Optimization Protocol</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-1 bg-background overflow-y-auto" data-lenis-prevent>
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={onClose}
                className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white transition-all border border-transparent hover:border-border/20"
              >
                <div className="h-10 w-10 rounded-lg bg-muted/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-light truncate">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:translate-x-0.5 group-hover:text-primary transition-all shrink-0" />
              </Link>
            ))}
          </div>

          <div className="p-4 bg-muted/10 border-t border-border shrink-0">
            <button 
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted/30 flex items-center justify-center group-hover:bg-destructive group-hover:text-white transition-colors duration-500 shrink-0">
                  <LogOut className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium uppercase tracking-widest">Terminate Session</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-30 group-hover:text-destructive shrink-0" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
