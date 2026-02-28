'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Mail, MapPin, Clock, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { WebPage } from '@/lib/types';

export default function EditContactCMS() {
  const db = useFirestore();
  const { toast } = useToast();
  const pageRef = useMemoFirebase(() => doc(db, 'pages', 'contact'), [db]);
  const { data: pageData, isLoading } = useDoc<WebPage>(pageRef);

  const [content, setContent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pageData?.content) setContent(pageData.content);
  }, [pageData]);

  const handleSave = () => {
    if (!pageRef || !content) return;
    setIsSaving(true);
    updateDocumentNonBlocking(pageRef, { content, updatedAt: new Date().toISOString() });
    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Contact Registry Updated", description: "Concierge identifiers have been synchronized." });
    }, 500);
  };

  const updateDetail = (index: number, field: string, value: string) => {
    const next = [...content.details];
    next[index][field] = value;
    setContent({ ...content, details: next });
  };

  if (isLoading || !content) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Button variant="accent" size="icon" asChild className="rounded-none h-10 w-10 border-none shrink-0"><Link href="/admin/cms"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="text-3xl font-headline font-normal">Contact Concierge</h1>
            <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Identity & Location Management</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="h-12 px-10 uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl shadow-primary/20">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Commit Changes
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-8">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Hero Identification</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-6 pt-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Main Headline</Label>
                <Input value={content.hero.title} onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })} className="h-12 bg-muted/20 border-none font-headline text-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Section Label</Label>
                <Input value={content.hero.label} onChange={(e) => setContent({ ...content, hero: { ...content.hero, label: e.target.value } })} className="h-12 bg-muted/20 border-none uppercase tracking-widest font-bold text-xs" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Contact Nodes</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, details: [...content.details, { label: 'New Node', value: '', desc: '' }] })} className="h-8 w-8"><Plus className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {content.details.map((node: any, idx: number) => (
                <div key={idx} className="p-6 bg-muted/10 rounded-xl relative group border border-transparent hover:border-primary/10 transition-all space-y-4">
                  <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, details: content.details.filter((_: any, i: number) => i !== idx) })} className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase tracking-widest">Identifier Label</Label>
                      <Input value={node.label} onChange={(e) => updateDetail(idx, 'label', e.target.value)} className="bg-background border-none h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase tracking-widest">Value</Label>
                      <Input value={node.value} onChange={(e) => updateDetail(idx, 'value', e.target.value)} className="bg-background border-none h-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest">Registry Description</Label>
                    <Input value={node.desc} onChange={(e) => updateDetail(idx, 'desc', e.target.value)} className="bg-background border-none h-10" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="bg-primary text-white border-none rounded-xl overflow-hidden shadow-2xl relative h-full">
            <CardContent className="p-10 relative z-10 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <Building2 className="h-12 w-12 text-white/20" />
                <h3 className="text-3xl font-headline leading-tight">Global <br /> Operations.</h3>
                <p className="text-white/70 font-light leading-relaxed text-sm">
                  These details establish the biological link between our clinical facilities and your community. Accuracy is vital for trust.
                </p>
              </div>
              <div className="mt-12 space-y-4">
                {content.details.slice(0, 3).map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 opacity-60">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{d.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </Card>
        </div>
      </div>
    </div>
  );
}
