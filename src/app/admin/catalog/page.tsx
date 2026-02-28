
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  ArrowUpDown,
  Layers,
  Activity,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Sparkles,
  Truck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase,
  deleteDocumentNonBlocking,
  useDoc,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Product, StoreSettings } from '@/lib/types';
import { predictiveLowStockAlert, PredictiveLowStockAlertOutput } from '@/ai/flows/predictive-low-stock-alert';

function TableRowSkeleton() {
  return (
    <TableRow className="border-border/20">
      <TableCell className="pl-6 py-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
      <TableCell><div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-1 w-24" /></div></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell className="text-right pr-6"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
    </TableRow>
  );
}

export default function AdminCatalogPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null
  });

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '';

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // AI Audit State
  const [auditProduct, setAuditProduct] = useState<Product | null>(null);
  const [auditResult, setAuditResult] = useState<PredictiveLowStockAlertOutput | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Pagination Logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (val: string) => {
    setPageSize(parseInt(val));
    setCurrentPage(1);
  };

  const handleCommitDeletion = () => {
    if (!deleteConfirm.product) return;
    const productRef = doc(db, 'products', deleteConfirm.product.id);
    deleteDocumentNonBlocking(productRef);
    
    toast({ title: "Registry Purged", description: `Formula ${deleteConfirm.product.name} node has been terminated.` });
    setDeleteConfirm({ open: false, product: null });

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleRunAudit = async (product: Product) => {
    setAuditProduct(product);
    setAuditResult(null);
    setIsAuditing(true);
    
    try {
      const result = await predictiveLowStockAlert({
        productName: product.name,
        currentStock: product.stock,
        salesHistory: [12, 15, 8, 14, 11, 10, 13], 
        reorderLeadTimeDays: 7,
        desiredSafetyStockDays: 14
      });
      setAuditResult(result);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Audit Failure", description: "Could not reach the clinical predictive models." });
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-normal text-primary">Formula Catalog</h1>
          <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Biological Infrastructure Management</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Search by name or SKU..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 pl-10 w-full md:w-72 bg-card border-none shadow-sm text-sm rounded-md outline-none" 
            />
          </div>
          <Button asChild className="h-11 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 border-none">
            <Link href="/admin/catalog/new">
              <Plus className="h-4 w-4 mr-2" /> New Formula
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-xl bg-card">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Active Catalog Nodes</CardTitle>
            <div className="flex items-center gap-4">
                <Badge variant="outline" className="font-mono text-[10px] bg-background">{filteredProducts.length} Entities</Badge>
                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest">
                    <ArrowUpDown className="h-3 w-3 mr-2" /> Sort
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest pl-6">Formula Identity</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Category</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Pricing</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Stock Level</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-right pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : paginatedProducts.map((product) => (
                <TableRow key={product.id} className="border-border/20 hover:bg-muted/5 transition-colors group">
                  <TableCell className="pl-6 py-6">
                    <div className="flex items-center gap-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative h-14 w-14 rounded-lg bg-muted/20 overflow-hidden border border-border/10 flex-shrink-0 cursor-zoom-in">
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name} 
                                  className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover:scale-110" 
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted/30">
                                  <Layers className="h-5 w-5 text-muted-foreground/40" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                                <Maximize2 className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="p-0 border-none shadow-2xl overflow-hidden bg-background">
                            <div className="p-2 bg-card">
                              <img src={product.imageUrl} alt={product.name} className="max-w-[200px] h-auto rounded-md shadow-sm" />
                              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary text-center pb-1">{product.name}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{product.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 border-primary/20 text-primary">SKU: {product.sku || 'UNASSIGNED'}</Badge>
                          <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-tighter opacity-40">{product.id}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary" className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 whitespace-nowrap border-none">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-headline text-base text-primary">{currencySymbol}{product.price?.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-light">{product.stock} Units</span>
                        <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    product.stock > 100 ? "bg-green-500" : product.stock > 50 ? "bg-yellow-500" : "bg-red-500"
                                )}
                                style={{ width: `${Math.min(100, (product.stock / 200) * 100)}%` }}
                            />
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "h-1.5 w-1.5 rounded-full animate-pulse",
                            product.stock > 0 ? "bg-green-500" : "bg-red-500"
                        )} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {product.stock > 0 ? 'Active' : 'Depleted'}
                        </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-[10px] font-bold uppercase tracking-widest w-52">
                        <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer p-2.5">
                          <Link href={`/admin/catalog/edit/${product.id}`}>
                            <Edit2 className="h-3 w-3 mr-2 text-primary" /> Edit Formula Data
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer p-2.5"
                          onClick={() => handleRunAudit(product)}
                        >
                          <Truck className="h-3 w-3 mr-2 text-primary" /> Run AI Stock Audit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer p-2.5">
                          <Link href={`/products/${product.id}`} target="_blank">
                            <ExternalLink className="h-3 w-3 mr-2 text-primary" /> View Public Node
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-destructive flex items-center gap-2 cursor-pointer p-2.5 hover:bg-destructive/5"
                            onClick={() => setDeleteConfirm({ open: true, product })}
                        >
                          <Trash2 className="h-3 w-3 mr-2" /> Terminate Formula
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && filteredProducts.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase tracking-widest">No formulas found in active catalog</p>
            </div>
          )}
        </CardContent>
        
        {!isLoading && filteredProducts.length > 0 && (
          <CardFooter className="bg-muted/10 border-t flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6">
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Showing {startIndex + 1} - {endIndex} of {totalItems} Clinical Nodes
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Per Page:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="h-8 w-16 text-[10px] bg-transparent border-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-[10px] font-bold uppercase tracking-widest">
                    {[5, 10, 20, 50].map(size => (
                      <SelectItem key={size} value={size.toString()} className="text-[10px]">{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" onClick={() => handlePageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <div className="flex items-center px-4"><span className="text-[10px] font-bold uppercase tracking-widest">Page {currentPage} / {totalPages}</span></div>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-lg rounded-xl">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Total SKUs</p>
              <p className="text-xl font-headline">{products?.length || 0} Active Node(s)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-sm rounded-xl">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Catalog Velocity</p>
              <p className="text-xl font-headline">98.4% Integrity</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-sm rounded-xl">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 text-orange-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">AI Integration</p>
              <p className="text-xl font-headline">Active Inline</p>
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

      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="bg-card border-none shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-xl flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Terminate Protocol?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-light pt-2 leading-relaxed">
              This action will permanently purge the formula node <span className="text-foreground font-medium">{deleteConfirm.product?.name}</span> (SKU: {deleteConfirm.product?.sku}) from the active clinical catalog. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="uppercase text-[10px] font-bold tracking-widest h-12 rounded-md border-border/20">Maintain Registry</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCommitDeletion}
              className="bg-destructive text-white hover:bg-destructive/90 uppercase text-[10px] font-bold tracking-widest h-12 rounded-md border-none"
            >
              Terminate Formula
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
