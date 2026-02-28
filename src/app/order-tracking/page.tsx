'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Download,
  FileText,
  ShieldCheck,
  AlertCircle,
  FlaskConical,
  Activity,
  ChevronDown,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Order, LifecycleEvent } from '@/lib/types';

const STATUS_ICONS: Record<string, any> = {
  'Confirmed': CheckCircle2,
  'Pending Verification': Clock,
  'Clinical Verification': ShieldCheck,
  'Lab Preparation': FlaskConical,
  'Sterile Packaging': Package,
  'Shipped': Truck,
  'Delivered': CheckCircle2,
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const db = useFirestore();
  
  const [orderIdInput, setOrderIdInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Default timeline for mock or fallback
  const defaultTimeline: LifecycleEvent[] = [
    { status: 'Pending Verification', timestamp: new Date().toISOString(), note: 'System received order registry.' },
  ];

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setError(null);

    try {
      // In a real app, we'd query by orderId and email
      // For this prototype, we'll try to find the order in any user's collection
      // (This is a simplified lookup for the demo)
      const q = query(collection(db, 'orders_global'), where('id', '==', orderIdInput), limit(1));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setOrder(snap.docs[0].data() as Order);
        setShowResult(true);
      } else {
        // Fallback to searching orders within the logged-in user if global doesn't work
        // or just mock for the sake of the lifecycle demonstration
        setError("Clinical record not found. Please verify your order ID.");
      }
    } catch (err) {
      console.error(err);
      setError("System delay. Could not reach clinical registry.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setOrderIdInput(id);
      // Automatically trigger search if ID is in URL
      // (Note: In a production app, we'd need email for security)
    }
  }, [searchParams]);

  const timeline = order?.timeline || defaultTimeline;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {!showResult ? (
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-muted-foreground font-bold">ORDER LOGISTICS</p>
                <h1 className="text-4xl md:text-6xl font-headline font-normal text-foreground leading-[1.1]">
                  Track your <br /> Journey.
                </h1>
                <p className="text-muted-foreground font-light leading-relaxed max-w-sm">
                  Enter your order details below to see real-time updates from our clinical fulfillment facility.
                </p>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-primary pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                        <img 
                          src={`https://picsum.photos/seed/${i + 10}/100/100`} 
                          alt="User" 
                          className="h-full w-full object-cover grayscale" 
                        />
                      </div>
                    ))}
                  </div>
                  <span>Batch Integrity Verified</span>
                </div>
              </div>

              <Card className="border-none shadow-none bg-card rounded-3xl overflow-hidden">
                <CardContent className="p-8 md:p-10">
                  <form onSubmit={handleTrack} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="order-id">Order Number</Label>
                      <Input 
                        id="order-id" 
                        placeholder="e.g. ORD-2024-001" 
                        value={orderIdInput}
                        onChange={(e) => setOrderIdInput(e.target.value)}
                        className="h-12 bg-muted/30 border-none" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="jane@example.com" 
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="h-12 bg-muted/30 border-none" 
                        required
                      />
                    </div>
                    {error && <p className="text-xs text-destructive font-medium uppercase tracking-widest">{error}</p>}
                    <Button 
                      type="submit" 
                      disabled={isSearching}
                      className="w-full h-14 text-sm font-bold tracking-widest uppercase bg-primary hover:bg-primary/90 rounded-xl"
                    >
                      {isSearching ? 'SEARCHING...' : (
                        <span className="flex items-center">TRACK ORDER <ArrowRight className="ml-2 h-4 w-4" /></span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border/30">
                <div>
                  <button 
                    onClick={() => setShowResult(false)}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-4 block transition-colors"
                  >
                    ← Back to Search
                  </button>
                  <h2 className="text-3xl font-headline font-normal">Order {order?.id}</h2>
                  <p className="text-muted-foreground font-light mt-1">Status: <span className="text-primary font-medium">{order?.status}</span></p>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order Date: {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                  <Button variant="default" className="h-10 px-6 uppercase text-[10px] font-bold tracking-widest rounded-md shadow-lg hover:shadow-primary/20">
                    <Download className="h-3 w-3 mr-2" /> Download Receipt
                  </Button>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-12 items-start">
                {/* Lifecycle Timeline */}
                <div className="lg:col-span-7 space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Clinical Lifecycle
                    </h3>
                    <div className="relative pl-8 space-y-12">
                      <div className="absolute left-3 top-2 bottom-2 w-px bg-border/50" />
                      
                      {timeline.map((event, i) => {
                        const Icon = STATUS_ICONS[event.status] || Package;
                        const isLatest = i === timeline.length - 1;
                        return (
                          <div key={i} className="relative group">
                            <div className={cn(
                              "absolute -left-[29px] top-0 h-6 w-6 rounded-full border-4 border-background z-10 flex items-center justify-center transition-colors duration-500",
                              isLatest ? "bg-primary text-white scale-110" : "bg-muted text-muted-foreground"
                            )}>
                              <Icon className="h-2.5 w-2.5" />
                            </div>
                            <div className="space-y-1">
                              <p className={cn("text-xs font-bold uppercase tracking-wider", isLatest ? "text-primary" : "text-foreground")}>
                                {event.status}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-light">
                                {new Date(event.timestamp).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground font-light leading-relaxed mt-2 p-4 bg-muted/20 rounded-xl border border-transparent group-hover:border-border/20 transition-all">
                                {event.note}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Batch Intelligence & QC Report */}
                <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
                  <Card className="border-none bg-primary text-white rounded-3xl overflow-hidden relative shadow-2xl">
                    <CardContent className="p-8 space-y-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                          <FlaskConical className="h-6 w-6" />
                        </div>
                        {order?.qcReport && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-none px-3">LAB VERIFIED</Badge>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-headline font-normal">Quality Control</h3>
                        <p className="text-sm text-white/70 font-light mt-2 leading-relaxed">
                          Your order has been allocated to our high-bioavailability batch registry. Every unit is scanned for purity.
                        </p>
                      </div>

                      {order?.qcReport ? (
                        <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-500">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Batch ID</p>
                              <p className="text-sm font-mono">{order.qcReport.batchId}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Purity</p>
                              <p className="text-sm font-headline">{order.qcReport.purityScore}%</p>
                            </div>
                          </div>
                          <Button asChild variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white hover:text-primary h-12 uppercase text-[10px] font-bold tracking-widest">
                            <Link href="#qc-report">VIEW FULL QC REPORT</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                          <Clock className="h-5 w-5 text-white/40 animate-pulse" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Audit Pending Stage</p>
                        </div>
                      )}
                    </CardContent>
                    <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                  </Card>

                  <div className="p-8 bg-accent/5 border border-accent/10 rounded-3xl space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Integrity Guarantee
                    </h4>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">
                      Pharmlogics utilizes blockchain-anchored batch records. Your QC report is a immutable proof of botanical purity and clinical efficacy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded QC Report Section */}
              {order?.qcReport && (
                <section id="qc-report" className="pt-12 mt-12 border-t border-border/30 animate-in fade-in duration-1000">
                  <div className="mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">OFFICIAL REGISTRY</p>
                    <h2 className="text-4xl font-headline font-normal">Clinical QC Report.</h2>
                  </div>
                  <Card className="border-none shadow-sm rounded-3xl bg-muted/10 overflow-hidden">
                    <CardContent className="p-8 md:p-12 space-y-10">
                      <div className="grid md:grid-cols-3 gap-12 border-b border-border/30 pb-10">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Laboratory Record</p>
                          <p className="font-mono text-sm">{order.qcReport.batchId}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Audit Date</p>
                          <p className="text-sm font-light">{order.qcReport.verifiedAt}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Certified Score</p>
                          <p className="text-sm font-headline text-primary">{order.qcReport.purityScore}% Biological Synergy</p>
                        </div>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground font-light text-base leading-relaxed whitespace-pre-line italic border-l-2 border-primary/20 pl-8">
                          {order.qcReport.reportText}
                        </p>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 opacity-60">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest">Compliance: FDA cGMP Standards</p>
                        </div>
                        <p className="text-[9px] font-mono uppercase tracking-widest">Verified by Pharmlogics Clinical AI-Node 01</p>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
