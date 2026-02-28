'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { WebPage } from '@/lib/types';

export default function EditProductsPageCMS() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const pageRef = useMemoFirebase(() => doc(db, 'pages', 'products'), [db]);
  const { data: pageData, isLoading } = useDoc<WebPage>(pageRef);

  const [content, setContent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pageData?.content) {
      setContent(pageData.content);
    }
  }, [pageData]);

  const handleSave = () => {
    if (!pageRef || !content) return;
    setIsSaving(true);
    
    updateDocumentNonBlocking(pageRef, {
      content,
      updatedAt: new Date().toISOString()
    });

    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Catalog Node Updated", description: "Products page sections have been synchronized." });
    }, 500);
  };

  const updateSection = (section: string, field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!pageData || !content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-headline">Catalog Registry Missing</h2>
          <p className="text-sm text-muted-foreground font-light max-w-sm">
            The clinical registry for the Products Page has not been provisioned in your cloud database.
          </p>
        </div>
        <Button variant="outline" asChild className="h-12 px-10 uppercase text-[10px] font-bold tracking-widest">
          <Link href="/admin/cms">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="accent" size="icon" asChild className="rounded-none h-10 w-10 border-none shrink-0">
            <Link href="/admin/cms"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-headline font-normal">Edit Products Page</h1>
            <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Catalog Content Registry</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="h-12 px-10 shadow-xl shadow-primary/20 uppercase text-[11px] font-bold tracking-[0.2em] bg-primary text-white hover:bg-primary/90">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Commit Catalog Node
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="h-auto p-0 bg-transparent flex flex-wrap justify-start gap-2 mb-12">
          {[
            { value: 'hero', icon: Sparkles, label: 'Hero Section' },
            { value: 'seo', icon: Search, label: 'Search Optimization' },
          ].map(tab => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="rounded-md px-6 py-3 border border-border/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <tab.icon className="h-3 w-3 mr-2" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="hero" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Catalog Hero Node</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Section Label</Label>
                <Input value={content.hero?.label || ''} onChange={(e) => updateSection('hero', 'label', e.target.value)} className="h-12 bg-muted/20 border-none uppercase tracking-widest font-bold text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Main Title</Label>
                <Input value={content.hero?.title || ''} onChange={(e) => updateSection('hero', 'title', e.target.value)} className="h-12 bg-muted/20 border-none font-headline text-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Description</Label>
                <Textarea value={content.hero?.description || ''} onChange={(e) => updateSection('hero', 'description', e.target.value)} className="min-h-[100px] bg-muted/20 border-none leading-relaxed" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Catalog Metadata</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Meta Title</Label>
                <Input value={content.seo?.title || ''} onChange={(e) => updateSection('seo', 'title', e.target.value)} className="h-12 bg-muted/20 border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Meta Description</Label>
                <Textarea value={content.seo?.description || ''} onChange={(e) => updateSection('seo', 'description', e.target.value)} className="min-h-[120px] bg-muted/20 border-none leading-relaxed" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
