
'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarMenuBadge,
  useSidebar
} from "@/components/ui/sidebar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  LogOut, 
  ExternalLink, 
  Package, 
  Layers, 
  Tag, 
  Settings, 
  FileText, 
  Users,
  Loader2,
  User,
  ShieldCheck,
  ChevronRight,
  ChevronsUpDown,
  Wifi,
  WifiOff,
  BookOpen,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, Order, StoreSettings } from "@/lib/types";
import { NotificationBell } from "@/components/common/NotificationBell";

type AdminRoleType = 'Super Admin' | 'Content Manager' | 'Logistics Staff' | null;

const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['Super Admin', 'Content Manager', 'Logistics Staff'] },
    { href: "/admin/catalog", label: "Formula Catalog", icon: Layers, roles: ['Super Admin', 'Content Manager'] },
    { href: "/admin/categories", label: "Categories", icon: Tag, roles: ['Super Admin', 'Content Manager'] },
    { href: "/admin/insights", label: "Insights Registry", icon: BookOpen, roles: ['Super Admin', 'Content Manager'] },
    { href: "/admin/users", label: "User Registry", icon: Users, roles: ['Super Admin'] },
    { href: "/admin/cms", label: "Content Mgmt", icon: FileText, roles: ['Super Admin', 'Content Manager'] },
    { href: "/admin/orders", label: "Fulfillment", icon: Package, roles: ['Super Admin', 'Logistics Staff'] },
    { href: "/admin/settings", label: "Settings", icon: Settings, roles: ['Super Admin'] },
];

function AdminSidebarHeader({ 
  role, 
  userName, 
  userEmail, 
  onLogout 
}: { 
  role: AdminRoleType, 
  userName?: string | null,
  userEmail?: string | null, 
  onLogout: () => void 
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const initials = useMemo(() => {
    if (userName && userName !== 'Admin Node') {
      return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return userEmail ? userEmail.slice(0, 2).toUpperCase() : 'AD';
  }, [userName, userEmail]);

  return (
    <SidebarHeader className="p-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton 
                size="lg" 
                className="data-[state=open]:bg-white/10 data-[state=open]:text-white transition-all duration-300 rounded-lg"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-primary shadow-md shrink-0">
                  <span className="font-headline text-lg font-bold">PL</span>
                </div>
                {!isCollapsed && (
                  <div className="grid flex-1 text-left text-sm leading-tight ml-1 animate-in fade-in duration-300 min-w-0">
                    <span className="truncate font-headline font-normal text-white">{userName || 'Admin Node'}</span>
                    <span className="truncate text-[10px] font-bold uppercase tracking-widest text-white/60">{role || 'Authenticating...'}</span>
                  </div>
                )}
                {!isCollapsed && <ChevronsUpDown className="ml-auto size-4 opacity-50 shrink-0" />}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="bottom" align="start" sideOffset={4}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-white font-headline">
                    {initials}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold uppercase text-[10px] tracking-widest text-muted-foreground">{role}</span>
                    <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer py-2">
                <Link href="/admin/profile" className="flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest">My Clinical Node</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer py-2 text-destructive focus:text-destructive focus:bg-destructive/5">
                <LogOut className="size-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [isOnline, setIsOnline] = useState(true);

    const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
    const { data: settings } = useDoc<StoreSettings>(settingsRef);
    const storeName = settings?.storeName || 'Clinical Brand';

    // Monitoring connectivity
    useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      if (typeof window !== 'undefined') {
        setIsOnline(navigator.onLine);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

    // Fetch Role
    const roleRef = useMemoFirebase(() => user ? doc(db, 'roles_admin', user.uid) : null, [db, user]);
    const { data: roleData, isLoading: isRoleLoading } = useDoc<{ role: AdminRoleType }>(roleRef);

    // Fetch Profile for Name
    const profileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
    const { data: profileData } = useDoc<UserProfile>(profileRef);

    // Role logic
    const activeRole = roleData?.role || null;
    const adminName = profileData ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() : (user?.displayName || 'Admin Node');

    // Monitor for New Orders - Guarded by activeRole to prevent early fetch permission errors
    const pendingOrdersQuery = useMemoFirebase(() => {
      if (!db || !user || !activeRole) return null;
      return query(collection(db, 'orders_global'), where('status', '==', 'Pending Verification'));
    }, [db, user, activeRole]);
    const { data: pendingOrders } = useCollection<Order>(pendingOrdersQuery);
    const pendingOrdersCount = pendingOrders?.length || 0;

    useEffect(() => {
        if (pathname === '/admin/login' || pathname === '/admin/signup') return;

        if (isUserLoading) return;

        if (!user) {
            localStorage.removeItem('pharmlogics_admin_auth');
            router.push('/admin/login');
            setIsAuthorized(false);
            return;
        }

        // Wait for role check to finish AND verify the role data belongs to the current user
        if (isRoleLoading) return;
        if (roleData && (roleData as any).id && (roleData as any).id !== user.uid) {
          // If we have data but it's for a different user ID, it's stale or wrong
          return;
        }

        if (activeRole) {
            setIsAuthorized(true);
            localStorage.setItem('pharmlogics_admin_auth', 'true');
        } else {
            toast({ 
                variant: "destructive", 
                title: "Privilege Error", 
                description: "Your identity node has not been assigned clinical privileges. Contact a Super Admin." 
            });
            localStorage.removeItem('pharmlogics_admin_auth');
            router.push('/admin/login');
            setIsAuthorized(false);
        }
    }, [user, isUserLoading, activeRole, isRoleLoading, roleData, pathname, router, toast]);

    const handleLogout = async () => {
        localStorage.removeItem('pharmlogics_admin_auth');
        await signOut(auth);
        router.push('/admin/login');
    };

    const filteredNavItems = useMemo(() => {
      if (!activeRole) return [];
      return adminNavItems.filter(item => item.roles.includes(activeRole));
    }, [activeRole]);

    const isActive = (href: string) => pathname.startsWith(href);

    if (pathname === '/admin/login' || pathname === '/admin/signup') {
        return <>{children}</>;
    }

    if (isAuthorized === null || isUserLoading || isRoleLoading) {
        return (
          <div className="h-screen w-full flex items-center justify-center bg-muted/10">
            <div className="text-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Verifying Clinical Permissions...</p>
            </div>
          </div>
        );
    }

    if (!isAuthorized) {
      return null;
    }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/20 w-full overflow-hidden">
        <Sidebar 
          collapsible="icon" 
          className="border-none shadow-none"
          style={{ 
            "--sidebar-background": "230 100% 36%",
            "--sidebar-foreground": "0 0% 100%",
            "--sidebar-primary": "0 0% 100%",
            "--sidebar-accent": "222 100% 50%",
            "--sidebar-accent-foreground": "0 0% 100%",
            "--sidebar-border": "0 0% 0% / 0",
            "--sidebar-ring": "21 100% 63%"
          } as React.CSSProperties}
        >
          <AdminSidebarHeader 
            role={activeRole} 
            userName={adminName}
            userEmail={user?.email} 
            onLogout={handleLogout} 
          />
          <SidebarContent className="px-2">
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.href)}
                    tooltip={{children: item.label, side: "right"}}
                    className={cn(
                      "h-12 px-4 rounded-md transition-all duration-300 hover:bg-white/10 hover:text-white",
                      isActive(item.href) ? "bg-secondary text-white shadow-md" : "text-white/70"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("h-5 w-5 transition-colors", isActive(item.href) ? "text-white" : "text-white/60")} />
                      <span className="font-medium text-[15px] tracking-wide">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.href === '/admin/orders' && pendingOrdersCount > 0 && (
                    <SidebarMenuBadge className="bg-accent text-white border-none font-bold tabular-nums top-1/2 -translate-y-1/2">
                      {pendingOrdersCount}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-white/10">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      tooltip="Back to site" 
                      className="h-10 text-white/60 hover:text-white hover:bg-white/5"
                    >
                        <Link href="/">
                            <ExternalLink className="h-5 w-5" />
                            <span className="text-[14px]">Public Site</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="overflow-hidden flex flex-col min-w-0 bg-background">
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
                <SidebarTrigger className="text-muted-foreground hover:text-primary transition-colors" />
                <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
                <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground truncate max-w-[150px] sm:max-w-none">
                    {storeName} Management
                </h2>
                <div className="ml-auto flex items-center gap-4">
                    <NotificationBell variant="dark" />
                    <div className={cn(
                      "flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full border transition-colors duration-500",
                      isOnline ? "bg-green-500/10 border-green-500/20" : "bg-destructive/10 border-destructive/20"
                    )}>
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isOnline ? "bg-green-500 animate-pulse" : "bg-destructive"
                        )} />
                        <span className={cn(
                          "text-[8px] sm:text-[9px] font-bold uppercase tracking-widest whitespace-nowrap",
                          isOnline ? "text-green-600" : "text-destructive"
                        )}>
                          {isOnline ? (
                            <><span className="hidden xs:inline">Systems</span> Online</>
                          ) : (
                            <><span className="hidden xs:inline">Systems</span> Offline</>
                          )}
                        </span>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 max-w-screen-2xl mx-auto w-full overflow-y-auto">
                {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
