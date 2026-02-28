
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  Package, 
  ClipboardCheck, 
  FlaskConical, 
  Truck, 
  CheckCircle2, 
  ExternalLink,
  MoreHorizontal,
  Loader2,
  Sparkles,
  ShieldCheck,
  Activity,
  Phone,
  Zap,
  Microscope,
  Box,
  Mail
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { StatusDialog } from '@/components/common/StatusDialog';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, useUser } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Order, OrderStatus, LifecycleEvent, QCReport } from '@/lib/types';
import { generateQCReport } from '@/ai/flows/qc-report-generator';
import { sendClinicalEmail } from '@/app/actions/email';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  'Pending Verification': { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: ClipboardCheck },
  'Clinical Verification': { label: 'Verified', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: ClipboardCheck },
  'Lab Preparation': { label: 'Lab Prep', color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: FlaskConical },
  'Sterile Packaging': { label: 'Packaging', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200', icon: Package },
  'Shipped': { label: 'Shipped', color: 'bg-orange-500/10 text-orange-600 border-orange-200', icon: Truck },
  'Delivered': { label: 'Delivered', color: 'bg-green-500/10 text-green-600 border-green-200', icon: CheckCircle2 },
  'Cancelled': { label: 'Cancelled', color: 'bg-red-500/10 text-red-600 border-red-200', icon: CheckCircle2 },
};

const AUTOMATED_LAB_STEPS: { status: OrderStatus; note: string; duration: number; icon: any }[] = [
  { status: 'Clinical Verification', note: 'Handshake complete. Batch authorized for clinical formulation.', duration: 1500, icon: ShieldCheck },
  { status: 'Lab Preparation', note: 'Bioactive coefficients verified. Formula constituents allocated to batch node.', duration: 1500, icon: Microscope },
  { status: 'Sterile Packaging', note: 'Vacuum-sealed in signature light-shielded pouch. Protocol integrity locked.', duration: 1500, icon: Box },
];

export default function AdminOrdersPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusDialog, setStatusDialog] = useState({ open: false, title: '', desc: '' });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [isGeneratingQC, setIsGeneratingQC] = useState(false);

  const [isLabProcessing, setIsLabProcessing] = useState(false);
  const [labProgress, setLabProgress] = useState(0);
  const [currentLabStep, setCurrentLabStep] = useState<typeof AUTOMATED_LAB_STEPS[0] | null>(null);

  // ordersQuery is guarded by user identity to prevent permission errors
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'orders_global'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  /**
   * Dispatches both an in-app notification and a REAL email trigger via Resend.
   */
  const dispatchCustomerUpdate = (order: Order, status: string, note?: string) => {
    if (!order.customerUid) return;

    // 1. Dispatch In-App Alert (Firestore)
    const notificationRef = collection(db, 'users', order.customerUid, 'notifications');
    addDocumentNonBlocking(notificationRef, {
      title: `Logistics Update: ${status}`,
      message: note || `Your formula batch ${order.id} has transitioned to the ${status} phase.`,
      type: status === 'Delivered' ? 'success' : 'info',
      read: false,
      createdAt: new Date().toISOString(),
      link: `/order-tracking?id=${order.id}`
    });

    // 2. Dispatch REAL Email Dispatch (Resend Server Action)
    sendClinicalEmail({
      to: order.customerEmail,
      subject: `[Pharmlogics] Clinical Update: Order ${order.id} is ${status}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #0000B8;">Logistics Update Dispatched</h2>
          <p>Your formula batch <strong>${order.id}</strong> has transitioned to the <strong>${status}</strong> phase.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${note}"</p>
          </div>
          <a href="https://pharmlogics.dev/order-tracking?id=${order.id}" style="background: #0000B8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Trace Your Node</a>
          <p style="font-size: 10px; color: #666; margin-top: 30px;">Authorized clinical update from Pharmlogics Healthcare.</p>
        </div>
      `
    }).then(res => {
      if (res.success) {
        toast({
          title: "Update Dispatched",
          description: `Notification and Resend node triggered for ${order.customerEmail}.`,
        });
      }
    });
  };

  const handleOpenStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setIsUpdatingStatus(true);
  };

  const handleCommitStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    const note = statusNote || `Order transitioned to ${newStatus} phase.`;
    const timelineEvent: LifecycleEvent = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note
    };

    const updatedTimeline = [...(selectedOrder.timeline || []), timelineEvent];
    const orderRef = doc(db, 'orders_global', selectedOrder.id);
    const userOrderRef = doc(db, 'users', selectedOrder.customerUid, 'orders', selectedOrder.id);

    const updateData = {
      status: newStatus,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString()
    };

    setDocumentNonBlocking(orderRef, updateData, { merge: true });
    setDocumentNonBlocking(userOrderRef, updateData, { merge: true });

    dispatchCustomerUpdate(selectedOrder, newStatus, note);

    setIsUpdatingStatus(false);
    setStatusDialog({
      open: true,
      title: "Lifecycle Synchronized",
      desc: `Order ${selectedOrder.id} has successfully transitioned to the ${newStatus} phase. In-app and Email updates dispatched.`
    });
  };

  const handleGenerateQC = async (order: Order) => {
    setIsGeneratingQC(true);
    try {
      const result = await generateQCReport({
        orderId: order.id,
        productNames: order.items.map(i => i.name)
      });

      const orderRef = doc(db, 'orders_global', order.id);
      const userOrderRef = doc(db, 'users', order.customerUid, 'orders', order.id);
      
      const updateData = { qcReport: result, updatedAt: new Date().toISOString() };
      setDocumentNonBlocking(orderRef, updateData, { merge: true });
      setDocumentNonBlocking(userOrderRef, updateData, { merge: true });

      const note = `Laboratory audit complete. Batch ${result.batchId} verified with ${result.purityScore}% biological synergy.`;
      dispatchCustomerUpdate(order, 'QC Verified', note);

      setStatusDialog({
        open: true,
        title: "QC Audit Registered",
        desc: `Laboratory batch ${result.batchId} has been verified. Updates dispatched.`
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Audit Failure", description: "System could not generate clinical audit." });
    } finally {
      setIsGeneratingQC(false);
    }
  };

  const handleProcessThroughLab = async (order: Order) => {
    setIsLabProcessing(true);
    setLabProgress(0);
    setSelectedOrder(order);

    let currentTimeline = [...(order.timeline || [])];
    const orderRef = doc(db, 'orders_global', order.id);
    const userOrderRef = doc(db, 'users', order.customerUid, 'orders', order.id);

    for (let i = 0; i < AUTOMATED_LAB_STEPS.length; i++) {
      const step = AUTOMATED_LAB_STEPS[i];
      setCurrentLabStep(step);
      setLabProgress(((i + 1) / AUTOMATED_LAB_STEPS.length) * 100);

      const event: LifecycleEvent = {
        status: step.status,
        timestamp: new Date().toISOString(),
        note: step.note
      };
      currentTimeline.push(event);

      const updateData = { status: step.status, timeline: currentTimeline, updatedAt: new Date().toISOString() };
      setDocumentNonBlocking(orderRef, updateData, { merge: true });
      setDocumentNonBlocking(userOrderRef, updateData, { merge: true });

      dispatchCustomerUpdate(order, step.status, step.note);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    setIsLabProcessing(false);
    setCurrentLabStep(null);
    setStatusDialog({
      open: true,
      title: "Lab Workflow Complete",
      desc: `Order ${order.id} has been processed. All updates were dispatched automatically.`
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-normal text-primary">Fulfillment Registry</h1>
          <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Clinical Protocol Logistics Control</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search ID, Name, or Mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 w-full md:w-72 bg-card border-none shadow-sm text-sm" 
            />
          </div>
          <Button variant="outline" className="h-11 px-4 bg-card border-none shadow-sm">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-xl bg-card">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Global Order Stream</CardTitle>
            <Badge variant="outline" className="font-mono text-[10px] bg-background">{(orders || []).length} Protocols Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest pl-6">Clinical Node ID</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">User Identity</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Batch Status</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Clinical Phase</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-right pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-64 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" /><p className="mt-4 uppercase text-[10px] font-bold tracking-widest opacity-40">Syncing Registry...</p></TableCell></TableRow>
              ) : filteredOrders.map((order) => {
                const StatusIcon = STATUS_CONFIG[order.status]?.icon || Package;
                return (
                  <TableRow key={order.id} className="border-border/20 hover:bg-muted/5 transition-colors group">
                    <TableCell className="pl-6 py-6 font-mono text-xs font-bold text-primary">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate max-w-[150px]">{order.customerName}</span>
                        <span className="text-[10px] text-muted-foreground font-light">{order.customerEmail}</span>
                        {order.customerPhone && (
                          <span className="text-[9px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                            <Phone className="h-2 w-2" /> {order.customerPhone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.qcReport ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <ShieldCheck className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground opacity-40">
                          <Activity className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Unverified</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenStatusModal(order)}
                        className={cn(
                          "h-9 px-3 rounded-full border text-[9px] font-bold uppercase tracking-widest",
                          STATUS_CONFIG[order.status]?.color
                        )}
                      >
                        <StatusIcon className="h-3 w-3 mr-2" />
                        {order.status}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-[10px] font-bold uppercase tracking-widest w-56 p-2">
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer p-2.5 rounded-md" onClick={() => handleGenerateQC(order)} disabled={isGeneratingQC || isLabProcessing}>
                            <Sparkles className="h-3 w-3 text-primary" /> Run Clinical Audit (QC)
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer p-2.5 rounded-md text-accent" onClick={() => handleProcessThroughLab(order)} disabled={isLabProcessing || order.status === 'Shipped' || order.status === 'Delivered'}>
                            <Zap className="h-3 w-3" /> Automated Lab Processing
                          </DropdownMenuItem>

                          <div className="h-px bg-border/50 my-1" />

                          <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer p-2.5 rounded-md">
                            <Link href={`/order-tracking?id=${order.id}`} target="_blank">
                              <ExternalLink className="h-3 w-3 text-primary" /> View Public Registry
                            </Link>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem className="text-destructive flex items-center gap-2 cursor-pointer p-2.5 rounded-md hover:bg-destructive/5">
                            Terminate Protocol
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!isLoading && filteredOrders.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase tracking-widest">No matching logistical nodes found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Lab Load</p>
              <p className="text-xl font-headline">82% Capacity</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-sm rounded-xl">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 text-orange-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Logistics Velocity</p>
              <p className="text-xl font-headline">14.2 Orders/Hr</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-sm rounded-xl">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">QC Integrity</p>
              <p className="text-xl font-headline">99.9% Pass Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isLabProcessing} onOpenChange={(open) => !open && !isLabProcessing && setIsLabProcessing(false)}>
        <DialogContent className="max-w-md bg-card border-none shadow-2xl rounded-2xl p-0 overflow-hidden [&>button]:hidden">
          <div className="p-8 bg-accent text-white">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 animate-pulse" />
              <h2 className="font-headline text-xl">Automated Lab Processing</h2>
            </div>
            <p className="text-white/70 font-light mt-1">
              Simulating clinical fulfillment sequence for <span className="text-white font-medium">{selectedOrder?.id}</span>.
            </p>
          </div>
          
          <div className="p-8 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentLabStep?.icon && <currentLabStep.icon className="h-4 w-4 text-accent" />}
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">
                    {currentLabStep?.status || 'Initializing Node...'}
                  </span>
                </div>
                <span className="text-xs font-mono opacity-40">{Math.round(labProgress)}%</span>
              </div>
              <Progress value={labProgress} className="h-1.5 bg-muted [&>div]:bg-accent" />
            </div>

            <div className="p-6 bg-muted/30 rounded-xl border border-dashed border-border/50">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">System Log:</p>
              <p className="text-sm font-light leading-relaxed italic text-foreground/80">
                {currentLabStep?.note || 'Handshaking with laboratory formulation nodes...'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 py-2 opacity-40">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Locked Session Active</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdatingStatus} onOpenChange={setIsUpdatingStatus}>
        <DialogContent className="max-w-md bg-card border-none shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="p-8 bg-primary text-white">
            <h2 className="font-headline text-xl">Lifecycle Transition</h2>
            <p className="text-white/70 font-light mt-1">Updating fulfillment stage for order <span className="text-white font-medium">{selectedOrder?.id}</span>.</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest">Target Phase</Label>
              <Select value={newStatus} onValueChange={(val) => setNewStatus(val as OrderStatus)}>
                <SelectTrigger className="h-12 bg-muted/20 border-none font-bold uppercase text-[10px] tracking-widest">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="text-[10px] font-bold uppercase tracking-widest">
                  {Object.keys(STATUS_CONFIG).map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest">Clinical Note (Timeline)</Label>
              <Textarea 
                placeholder="Describe the clinical progress or logistical milestone..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="min-h-[100px] bg-muted/20 border-none resize-none text-sm leading-relaxed"
              />
            </div>

            <Button onClick={handleCommitStatusUpdate} className="w-full h-12 uppercase text-[10px] font-bold tracking-widest bg-primary text-white border-none">
              Commit Lifecycle Node
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <StatusDialog 
        open={statusDialog.open} 
        onOpenChange={(open) => setStatusDialog(prev => ({ ...prev, open }))}
        title={statusDialog.title}
        description={statusDialog.desc}
      />
    </div>
  );
}
