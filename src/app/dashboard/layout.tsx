
'use client';

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Repeat, User, Activity, Loader2 } from "lucide-react";
import { useUser } from "@/firebase";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/progress", label: "My Progress", icon: Activity },
    { href: "/dashboard/orders", label: "Orders", icon: Package },
    { href: "/dashboard/subscriptions", label: "Subscriptions", icon: Repeat },
    { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const isActive = (href: string) => pathname === href;

    useEffect(() => {
      if (!isUserLoading && !user) {
        router.push('/login');
      }
    }, [user, isUserLoading, router]);

    // Prevent content flash while authenticating
    if (isUserLoading || !user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20 mx-auto" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
              Verifying Clinical Session...
            </p>
          </div>
        </div>
      );
    }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Account Navigation */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-card rounded-xl p-8 border border-border/10 shadow-sm sticky top-24">
              <div className="mb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">MY ACCOUNT</p>
                <h2 className="text-2xl font-headline font-normal mt-1">Portal</h2>
              </div>
              <nav className="flex flex-col gap-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-md text-sm font-light transition-all",
                      isActive(item.href) 
                        ? "bg-primary text-white shadow-md font-normal" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive(item.href) ? "text-white" : "text-primary/60")} />
                    {item.label}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-12 pt-8 border-t border-dashed">
                <div className="px-4 py-6 bg-accent/5 rounded-xl border border-accent/10">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-accent mb-2">Need Help?</p>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed mb-4">
                    Our clinical concierge is available 24/7 for support.
                  </p>
                  <Link href="/contact" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                    Contact Support →
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
