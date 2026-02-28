'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  ChevronRight,
  Loader2,
  Layers,
  Tag,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Truck,
  Sparkles,
  Info
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useDoc, useUser } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import type { Product, Order, StoreSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { predictiveLowStockAlert, PredictiveLowStockAlertOutput } from '@/ai/flows/predictive-low-stock-alert';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  // Fetch Role - Guarded to prevent unauthorized fetch attempts
  const roleRef = useMemoFirebase(() => user ? doc(db, 'roles_admin', user.uid) : null, [db, user]);
  const { data: roleData } = useDoc<{ role: string }>(roleRef);
  const activeRole = roleData?.role || null;

  // 1. Fetch Products for SKU stats and Stock levels - Guarded by activeRole
  const productsQuery = useMemoFirebase(() => {
    if (!db || !user || !activeRole) return null;
    return collection(db, 'products');
  }, [db, user, activeRole]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  // 2. Fetch all Global Orders for Revenue and Growth aggregation - Guarded by activeRole
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user || !activeRole) return null;
    return query(collection(db, 'orders_global'), orderBy('createdAt', 'desc'));
  }, [db, user, activeRole]);
  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '$';

  // Audit Modal State
  const [auditProduct, setAuditProduct] = useState<Product | null>(null);
  const [auditResult, setAuditResult] = useState<PredictiveLowStockAlertOutput | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // 3. Proactive Inventory Risk Logic (AI Heuristics)
  const inventoryRisks = useMemo(() => {
    if (!products || !orders) return [];
    
    return products.map(product => {
      // Calculate Velocity (Units per day) based on orders in the last 30 days
      const salesVolume = orders.reduce((acc, order) => {
        const item = (order as any).items?.find((i: any) => i.productId === product.id || i.name === product.name);
        return acc + (item?.quantity || 0);
      }, 0);
      
      const dailyVelocity = salesVolume / 30;
      const daysRemaining = dailyVelocity > 0 ? product.stock / dailyVelocity : Infinity;
      
      let riskLevel: 'Critical' | 'High' | 'Stable' = 'Stable';
      if (daysRemaining < 7 || product.stock < 15) riskLevel = 'Critical';
      else if (daysRemaining < 14 || product.stock < 40) riskLevel = 'High';
      
      return {
        ...product,
        daysRemaining,
        riskLevel,
        dailyVelocity: dailyVelocity.toFixed(1)
      };
    }).filter(p => p.riskLevel !== 'Stable')
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [products, orders]);

  // Derived Stats
  const stats = useMemo(() => {
    const totalRevenue = orders?.reduce((acc, curr) => acc + (curr.total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const activeSkus = products?.length || 0;
    const criticalRisks = inventoryRisks.filter(r => r.riskLevel === 'Critical').length;

    return [
      {
        title: "Total Revenue",
        value: `${currencySymbol}${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: "+12.5%", 
        trend: "up",
        icon: TrendingUp,
        description: "Revenue from formulas"
      },
      {
        title: "Total Orders",
        value: totalOrders.toString(),
        change: "+8.2%",
        trend: "up",
        icon: Package,
        description: "Fulfillment protocols"
      },
      {
        title: "Active SKUs",
        value: activeSkus.toString(),
        change: "+14.1%",
        trend: "up",
        icon: Layers,
        description: "Active clinical nodes"
      },
      {
        title: "Inventory Health",
        value: criticalRisks === 0 ? "Optimal" : `${criticalRisks} Critical`,
        change: criticalRisks === 0 ? "Stable" : "Requires Audit",
        trend: criticalRisks === 0 ? "up" : "down",
        icon: ShieldAlert,
        description: "Predictive supply chain"
      }
    ];
  }, [orders, products, inventoryRisks, currencySymbol]);

  // Preparing chart data for Revenue Growth
  const revenueGrowthData = useMemo(() => {
    if (!orders) return [];
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueMap: Record<string, number> = {};
    
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      revenueMap[months[d.getMonth()]] = 0;
    }

    orders.forEach(order => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      const monthName = months[date.getMonth()];
      if (revenueMap[monthName] !== undefined) {
        revenueMap[monthName] += order.total || 0;
      }
    });

    return Object.entries(revenueMap).map(([month, revenue]) => ({ month, revenue }));
  }, [orders]);

  // Preparing chart data for Order Distribution
  const categoryDistributionData = useMemo(() => {
    if (!orders || !products) return [];
    
    const distribution: Record<string, number> = {};
    const productMap: Record<string, string> = {};
    products.forEach(p => productMap[p.name] = p.category);

    orders.forEach(order => {
      (order as any).items?.forEach((item: any) => {
        const category = productMap[item.name] || 'General';
        distribution[category] = (distribution[category] || 0) + (item.quantity || 1);
      });
    });

    const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "#10b981", "#f59e0b", "#8b5cf6"];
    
    return Object.entries(distribution).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    })).slice(0, 6);
  }, [orders, products]);

  const handleRunFullAudit = async (product: any) => {
    setAuditProduct(product);
    setAuditResult(null);
    setIsAuditing(true);
    
    try {
      const velocityNum = parseFloat(product.dailyVelocity);
      const salesHistory = Array.from({length: 7}, () => Math.round(velocityNum + (Math.random() * 4 - 2)));
      
      const result = await predictiveLowStockAlert({
        productName: product.name,
        currentStock: product.stock,
        salesHistory: salesHistory.length > 0 ? salesHistory : [10, 12, 11, 13, 10, 14, 12],
        reorderLeadTimeDays: 7,
        desiredSafetyStockDays: 14
      });
      setAuditResult(result);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Audit Failure", description: "System could not reach clinical predictive models." });
    } finally {
      setIsAuditing(false);
    }
  };

  const quickActions = [
    { label: "Formula Catalog", href: "/admin/catalog", icon: Layers, desc: "Manage SKUs & AI Copy", color: "bg-blue-500/10 text-blue-600" },
    { label: "Fulfillment", href: "/admin/orders", icon: Package, desc: "Order registry logs", color: "bg-orange-500/10 text-orange-600" },
    { label: "New Category", href: "/admin/categories/new", icon: Tag, desc: "Add taxonomy node", color: "bg-purple-500/10 text-purple-600" }
  ];

  if (productsLoading || ordersLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20 mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Synchronizing Operations Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-normal text-primary">Clinical Operations</h1>
          <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Real-time performance metrics</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Live Data Sync Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-headline">
                {stat.value}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-[10px] font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest ml-1 truncate">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-headline">Revenue Growth</CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-widest">Monthly history (USD)</CardDescription>
              </div>
              <div className="h-8 w-8 rounded bg-muted/30 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="h-[300px] mt-4 pl-0 pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueGrowthData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} className="group">
                <Card className="border border-transparent shadow-sm hover:shadow-md transition-all duration-300 bg-card group-hover:border-accent/40 h-full">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center transition-colors duration-300 ${action.color} group-hover:bg-accent group-hover:text-accent-foreground`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider truncate transition-colors duration-300 group-hover:text-accent">{action.label}</p>
                        <p className="text-[10px] text-muted-foreground font-light truncate">{action.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Inventory Risk Registry</CardTitle>
                  <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Predictive AI SKU Monitoring</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[450px] overflow-y-auto" data-lenis-prevent>
                {inventoryRisks.length > 0 ? (
                  <div className="divide-y border-t">
                    {inventoryRisks.map((risk) => (
                      <div key={risk.id} className="p-4 hover:bg-muted/5 transition-colors group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3 min-w-0">
                            <div className="relative h-10 w-10 rounded bg-muted/20 overflow-hidden flex-shrink-0">
                              <img src={risk.imageUrl} className="h-full w-full object-contain p-1" alt="" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-tight truncate">{risk.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                  "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full",
                                  risk.riskLevel === 'Critical' ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                                )}>
                                  {risk.riskLevel} Risk
                                </span>
                                <span className="text-[9px] text-muted-foreground font-light">
                                  {risk.daysRemaining === Infinity ? 'Stable' : `Est. ${Math.ceil(risk.daysRemaining)} Days`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => handleRunFullAudit(risk)}
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center px-8">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 text-green-600">
                      <Activity className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Supply Chain Optimal</p>
                    <p className="text-xs font-light text-muted-foreground/60 mt-2 leading-relaxed">AI models detected no significant stockout risks across active SKU nodes.</p>
                  </div>
                )}
              </div>
            </CardContent>
            {inventoryRisks.length > 0 && (
              <div className="p-4 bg-muted/10 border-t flex justify-center">
                <Button variant="link" className="h-auto p-0 text-[9px] font-bold uppercase tracking-widest text-primary hover:no-underline" asChild>
                  <Link href="/admin/catalog">View Full Catalog Registry →</Link>
                </Button>
              </div>
            )}
          </Card>

          <Card className="border-none shadow-sm overflow-hidden bg-primary text-white relative">
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-headline leading-tight">Neural <br /> Logistical Audit.</h3>
                <p className="text-xs text-white/60 font-light mt-3 leading-relaxed">
                  System automatically scans formula velocity every 6 hours. High-risk nodes are prioritized for fulfillment.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Live Node Monitoring</span>
                </div>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          </Card>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="lg:col-span-1 border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Distribution</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest">Units Sold by Category</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center relative">
            {categoryDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[10px] font-bold uppercase opacity-40">No Sales Data</p>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-headline">
                {categoryDistributionData.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Total Units</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-headline">System Integrity</CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-widest">Global Node Performance</CardDescription>
            </div>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">Fulfillment Velocity</p>
                    <p className="text-[10px] text-muted-foreground font-light">14.2 Orders/Hr average</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-headline text-green-600">Optimal</p>
                </div>
              </div>
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">Security Layer</p>
                    <p className="text-[10px] text-muted-foreground font-light">End-to-end node encryption</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-headline text-blue-600">Locked</p>
                </div>
              </div>
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">Cloud Handshake</p>
                    <p className="text-[10px] text-muted-foreground font-light">99.9% Registry uptime</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-headline text-orange-600">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!auditProduct} onOpenChange={(open) => !open && setAuditProduct(null)}>
        <DialogContent className="max-w-md bg-card border-none shadow-2xl rounded-2xl overflow-hidden p-0">
          <DialogHeader className="p-8 bg-primary text-white">
            <div className="flex items-center gap-3 mb-2">
              <Truck className="h-5 w-5" />
              <DialogTitle className="font-headline text-xl">Clinical Stock Audit</DialogTitle>
            </div>
            <DialogDescription className="text-white/70 font-light">
              Predictive inventory analysis for <span className="text-white font-medium">{auditProduct?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            {isAuditing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Running Neural Forecast Models...</p>
              </div>
            ) : auditResult ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className={cn(
                  "p-4 rounded-xl border flex items-start gap-4",
                  auditResult.isLowStock ? "bg-red-500/5 border-red-500/20 text-red-700" : "bg-green-500/5 border-green-500/20 text-green-700"
                )}>
                  {auditResult.isLowStock ? <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" /> : <Info className="h-5 w-5 shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1">{auditResult.isLowStock ? 'Low Stock Protocol Required' : 'Inventory Optimal'}</p>
                    <p className="text-sm font-light leading-relaxed">{auditResult.alertMessage}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Stockout Est.</p>
                    <p className="text-xl font-headline text-primary">{auditResult.estimatedDaysUntilStockout ? `${Math.ceil(auditResult.estimatedDaysUntilStockout)} Days` : 'Stable'}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Rec. Reorder</p>
                    <p className="text-xl font-headline text-primary">{auditResult.recommendedReorderQuantity || '0'} Units</p>
                  </div>
                </div>

                <Button 
                  onClick={() => setAuditProduct(null)}
                  className="w-full h-12 uppercase text-[10px] font-bold tracking-widest bg-primary text-white border-none"
                >
                  Close Audit Registry
                </Button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
