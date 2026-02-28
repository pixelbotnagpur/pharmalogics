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
  Tag,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Layers
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);
  const { data: categories, isLoading } = useCollection<Category>(categoriesQuery);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Pagination Logic
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Terminate taxonomy node "${name}"? This may impact products assigned to this category.`)) {
      const categoryRef = doc(db, 'categories', id);
      deleteDocumentNonBlocking(categoryRef);
      toast({
        title: "Node Terminated",
        description: `Taxonomy node ${name} has been removed from the registry.`,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-normal text-primary">Clinical Taxonomy</h1>
          <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Classification Infrastructure Management</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search taxonomy..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 pl-10 w-full md:w-72 bg-card border-none shadow-sm text-sm" 
            />
          </div>
          <Button asChild className="h-11 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <Link href="/admin/categories/new">
              <Plus className="h-4 w-4 mr-2" /> New Category
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-xl bg-card">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Active Taxonomy Nodes</CardTitle>
            <Badge variant="outline" className="font-mono text-[10px] bg-background">{filteredCategories.length} Nodes</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest pl-6">Taxonomy Node</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">URL Slug</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Registry ID</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-right pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Retrieving Classification Nodes...</p>
                  </TableCell>
                </TableRow>
              ) : paginatedCategories.length > 0 ? (
                paginatedCategories.map((category) => (
                  <TableRow key={category.id} className="border-border/20 hover:bg-muted/5 transition-colors group">
                    <TableCell className="pl-6 py-6">
                      <div className="flex items-center gap-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative h-12 w-12 rounded-lg bg-muted/20 overflow-hidden border border-border/10 flex-shrink-0 cursor-zoom-in">
                                {category.imageSrc ? (
                                  <img 
                                    src={category.imageSrc} 
                                    alt={category.name} 
                                    className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover:scale-110" 
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-muted/30">
                                    <Tag className="h-5 w-5 text-muted-foreground/40" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                                  <Maximize2 className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="p-0 border-none shadow-2xl overflow-hidden bg-background">
                              <div className="p-2 bg-card">
                                <img src={category.imageSrc} alt={category.name} className="max-w-[200px] h-auto rounded-md shadow-sm" />
                                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary text-center pb-1">{category.name}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{category.name}</span>
                          <span className="text-[10px] text-muted-foreground font-light truncate max-w-[250px]">{category.description}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-[10px] bg-muted px-2 py-1 rounded">/{category.slug}</code>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{category.id}</span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-[10px] font-bold uppercase tracking-widest w-48">
                          <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer p-2.5">
                            <Link href={`/admin/categories/edit/${category.id}`}>
                              <Edit2 className="h-3 w-3 mr-2 text-primary" /> Edit Node Data
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer p-2.5">
                            <Link href={`/products/category/${category.slug}`} target="_blank">
                              <ExternalLink className="h-3 w-3 mr-2 text-primary" /> View Public Collection
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                              className="text-destructive flex items-center gap-2 cursor-pointer p-2.5 hover:bg-destructive/5"
                              onClick={() => handleDeleteCategory(category.id, category.name)}
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
                  <TableCell colSpan={4} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <Layers className="h-16 w-16 text-muted-foreground/20" strokeWidth={1} />
                        <Tag className="h-8 w-8 text-primary absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full border border-border/20 shadow-sm" />
                      </div>
                      <div className="max-w-xs space-y-2">
                        <h3 className="text-xl font-headline font-normal text-foreground">Registry Empty</h3>
                        <p className="text-muted-foreground font-light text-sm">
                          The clinical taxonomy registry is currently empty. Register your first category to begin building your biological catalog.
                        </p>
                      </div>
                      <Button asChild size="lg" className="h-12 px-10 uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl shadow-primary/10">
                        <Link href="/admin/categories/new">
                          <Plus className="h-4 w-4 mr-2" /> Register First Category
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        {/* Pagination Footer */}
        {!isLoading && filteredCategories.length > 0 && (
          <CardFooter className="bg-muted/10 border-t flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6">
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Showing {startIndex + 1} - {endIndex} of {totalItems} Taxonomy Nodes
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-md bg-background border-border/30 hover:bg-primary hover:text-white transition-colors" 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-md bg-background border-border/30 hover:bg-primary hover:text-white transition-colors" 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center px-4">
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Page {currentPage} / {totalPages}
                </span>
              </div>

              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-md bg-background border-border/30 hover:bg-primary hover:text-white transition-colors" 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-md bg-background border-border/30 hover:bg-primary hover:text-white transition-colors" 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
