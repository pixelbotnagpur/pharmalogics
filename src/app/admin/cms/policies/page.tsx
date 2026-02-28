'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  ShieldCheck, 
  Truck, 
  FileText, 
  Cookie,
  Plus,
  Trash2,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { WebPage } from '@/lib/types';

const POLICY_NODES = [
  { id: 'delivery-and-returns', label: 'Delivery', icon: Truck },
  { id: 'terms-and-conditions', label: 'Terms', icon: FileText },
  { id: 'privacy-policy', label: 'Privacy', icon: Lock },
  { id: 'cookie-policy', label: 'Cookies', icon: Cookie },
];

export default function EditPoliciesCMS() {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('delivery-and-returns');
  const [policyData, setPolicyData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const data: any = {};
      const { getDoc } = await import('firebase/firestore');
      for (const node of POLICY_NODES) {
        const snap = await getDoc(doc(db, 'pages', node.id));
        if (snap.exists()) data[node.id] = snap.data();
      }
      setPolicyData(data);
      setIsLoading(false);
    };
    fetchAll();
  }, [db]);

  const handleSave = async () => {
    const current = policyData[activeTab];
    if (!current) return;
    setIsSaving(true);
    
    await updateDocumentNonBlocking(doc(db, 'pages', activeTab), {
      ...current,
      updatedAt: new Date().toISOString()
    });

    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Policy Node Updated", description: "Clinical guidelines have been synchronized." });
    }, 500);
  };

  const updateSection = (id: string, index: number, field: string, value: string) => {
    const next = { ...policyData };
    next[id].content.sections[index][field] = value;
    setPolicyData(next);
  };

  const addSection = (id: string) => {
    const next = { ...policyData };
    if (!next[id].content.sections) next[id].content.sections = [];
    next[id].content.sections.push({ title: 'New Provision', content: 'Clinical detail text...' });
    setPolicyData(next);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Button variant="accent" size="icon" asChild className="rounded-none h-10 w-10 border-none shrink-0"><Link href="/admin/cms"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="text-3xl font-headline font-normal">Legal Governance</h1>
            <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Policy Registry Management</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="h-12 px-10 uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Commit Registry
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent h-auto p-0 flex flex-wrap justify-start gap-2 mb-12">
          {POLICY_NODES.map(node => (
            <TabsTrigger 
              key={node.id} 
              value={node.id} 
              className="rounded-md px-6 py-3 border border-border/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <node.icon className="h-3 w-3 mr-2" /> {node.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {POLICY_NODES.map(node => (
          <TabsContent key={node.id} value={node.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Provision Registry</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Introductory Narrative</Label>
                  <Textarea 
                    value={policyData[node.id]?.content?.intro || ''} 
                    onChange={(e) => {
                      const next = { ...policyData };
                      next[node.id].content.intro = e.target.value;
                      setPolicyData(next);
                    }}
                    className="min-h-[100px] bg-muted/20 border-none text-sm font-light leading-relaxed"
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4"><h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Clinical Provisions</h4></div>
                  {policyData[node.id]?.content?.sections?.map((section: any, idx: number) => (
                    <div key={idx} className="p-6 bg-muted/10 rounded-xl relative group border border-transparent hover:border-primary/10 transition-all space-y-4">
                      <Button variant="ghost" size="icon" onClick={() => {
                        const next = { ...policyData };
                        next[node.id].content.sections = next[node.id].content.sections.filter((_: any, i: number) => i !== idx);
                        setPolicyData(next);
                      }} className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Provision Title</Label>
                        <Input value={section.title} onChange={(e) => updateSection(node.id, idx, 'title', e.target.value)} className="bg-background border-none h-10 font-bold text-xs" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Full Provision Detail</Label>
                        <Textarea value={section.content} onChange={(e) => updateSection(node.id, idx, 'content', e.target.value)} className="bg-background border-none min-h-[120px] text-sm font-light leading-relaxed" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => addSection(node.id)} className="w-full h-12 border-dashed border-primary/30 text-primary hover:bg-primary/5 uppercase text-[9px] font-bold tracking-widest">
                    <Plus className="h-3 w-3 mr-2" /> Add Provision Node
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
