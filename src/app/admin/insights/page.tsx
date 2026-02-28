
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
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  BookOpen,
  Calendar,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Database
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { StatusDialog } from '@/components/common/StatusDialog';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Insight } from '@/lib/types';
import { initializeClinicalRegistry } from '@/lib/initialization';
import { cn } from '@/lib/utils';

export default function AdminInsightsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ open: false, title: '', desc: '' });

  const insightsQuery = useMemoFirebase(() => collection(db, 'insights'), [db]);
  const { data: insights, isLoading } = useCollection<Insight>(insightsQuery);

  const filteredInsights = useMemo(() => {
    if (!insights) return [];
    return insights.filter(i => 
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [insights, searchTerm]);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Purge research node "${title}" from the registry?`)) {
      deleteDocumentNonBlocking(doc(db, 'insights', id));
      setStatusDialog({
        open: true,
        title: "Protocol Purged",
        desc: `Insight "${title}" has been permanently removed from the clinical registry.`
      });
    }
  };

  const handleSyncLabs = async () => {
    setIsInitializing(true);
    try {
      await initializeClinicalRegistry(db);
      setStatusDialog({
        open: true,
        title: "Labs Synchronized",
        desc: "Laboratory research nodes and clinical protocols have been successfully deployed to the registry."
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failure", description: error.message });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-normal text-primary">Research Registry</h1>
          <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Clinical Insight & Protocol Management</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search registry or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 w-full md:w-72 bg-card border-none shadow-sm text-sm" 
            />
          </div>
          <Button asChild className="h-11 px-6 shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90 border-none">
            <Link href="/admin/insights/new">
              <Plus className="h-4 w-4 mr-2" /> New Insight Node
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-xl bg-card">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Laboratory Log Stream</CardTitle>
            <Badge variant="outline" className="font-mono text-[10px] bg-background">{filteredInsights.length} Nodes Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest pl-6">Research Abstract</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Classification</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Registry Date</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-right pr-6">Governance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-64 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" /><p className="mt-4 uppercase text-[10px] font-bold tracking-widest opacity-40">Synchronizing Insights Registry...</p></TableCell></TableRow>
              ) : filteredInsights.length > 0 ? (
                filteredInsights.map((insight) => (
                  <TableRow key={insight.id} className="border-border/20 hover:bg-muted/5 transition-colors group">
                    <TableCell className="pl-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted/20 overflow-hidden border border-border/10 shrink-0">
                          <img src={insight.imageUrl} className="h-full w-full object-cover grayscale opacity-60" alt="" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-[250px]">{insight.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 border-primary/20 text-primary">ID: {insight.id}</Badge>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest truncate max-w-[200px]">{insight.authorName}</p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="accent" className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 border-none">
                        {insight.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {insight.published ? (
                          <><div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Live</span></>
                        ) : (
                          <><div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" /><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Draft</span></>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-light">{insight.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-[10px] font-bold uppercase tracking-widest w-52 p-2">
                          <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer p-2.5 rounded-md">
                            <Link href={`/admin/insights/edit/${insight.id}`}>
                              <Edit2 className="h-3 w-3 mr-2 text-primary" /> Edit Protocol Node
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer p-2.5 rounded-md">
                            <Link href={`/blog/${insight.id}`} target="_blank">
                              <ExternalLink className="h-3 w-3 mr-2 text-primary" /> View Public Abstract
                            </Link>
                          </DropdownMenuItem>
                          <div className="h-px bg-border/50 my-1" />
                          <DropdownMenuItem 
                            className="text-destructive flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-destructive/5"
                            onClick={() => handleDelete(insight.id, insight.title)}
                          >
                            <Trash2 className="h-3 w-3 mr-2" /> Terminate Node
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center space-y-8 py-12">
                      <div className="relative">
                        <BookOpen className="h-16 w-16 text-muted-foreground/20" strokeWidth={1} />
                        <Database className="h-8 w-8 text-primary absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full border border-border/20 shadow-sm" />
                      </div>
                      <div className="max-w-xs space-y-2">
                        <h3 className="text-xl font-headline font-normal text-foreground">Registry Node Empty</h3>
                        <p className="text-muted-foreground font-light text-sm">
                          The research registry is currently uninitialized. Synchronize with our global laboratory nodes to deploy baseline optimization protocols.
                        </p>
                      </div>
                      <div className="flex flex-col w-full max-w-[240px] gap-3">
                        <Button 
                          onClick={handleSyncLabs} 
                          disabled={isInitializing}
                          className="h-12 w-full uppercase text-[10px] font-bold tracking-[0.2em] shadow-xl shadow-primary/10 bg-primary text-white hover:bg-primary/90 border-none"
                        >
                          {isInitializing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                          Sync Laboratory Data
                        </Button>
                        <Button asChild variant="outline" className="h-12 w-full uppercase text-[10px] font-bold tracking-[0.2em]">
                          <Link href="/admin/insights/new">Manual Entry</Link>
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StatusDialog 
        open={statusDialog.open} 
        onOpenChange={(open) => setStatusDialog(prev => ({ ...prev, open }))}
        title={statusDialog.title}
        description={statusDialog.desc}
      />
    </div>
  );
}
