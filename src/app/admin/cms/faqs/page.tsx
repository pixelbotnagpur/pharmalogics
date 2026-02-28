
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus,
  Trash2,
  HelpCircle,
  GripVertical,
  Database,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { WebPage } from '@/lib/types';

export default function EditFaqsCMS() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const pageRef = useMemoFirebase(() => doc(db, 'pages', 'faqs'), [db]);
  const { data: pageData, isLoading } = useDoc<WebPage>(pageRef);

  const [sections, setSections] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pageData?.content?.sections) {
      setSections(pageData.content.sections);
    }
  }, [pageData]);

  const handleSave = () => {
    if (!pageRef) return;
    setIsSaving(true);
    
    updateDocumentNonBlocking(pageRef, {
      content: { sections },
      updatedAt: new Date().toISOString()
    });

    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "FAQ Registry Updated", description: "Clinical support nodes have been synchronized." });
    }, 500);
  };

  const addSection = () => {
    setSections([...sections, { id: Date.now().toString(), title: 'New Category', questions: [] }]);
  };

  const addQuestion = (sIndex: number) => {
    const newSections = [...sections];
    newSections[sIndex].questions.push({ q: 'New Question?', a: 'Answer text...' });
    setSections(newSections);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const removeQuestion = (sIndex: number, qIndex: number) => {
    const newSections = [...sections];
    newSections[sIndex].questions = newSections[sIndex].questions.filter((_: any, i: number) => i !== qIndex);
    setSections(newSections);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;

  if (!pageData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-headline">FAQ Registry Missing</h2>
          <p className="text-sm text-muted-foreground font-light max-w-sm">
            The clinical registry for FAQs has not been initialized.
          </p>
        </div>
        <Button asChild className="h-12 px-10 uppercase text-[10px] font-bold tracking-widest">
          <Link href="/admin/cms"><Database className="h-4 w-4 mr-2" /> Return to CMS Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Button variant="accent" size="icon" asChild className="rounded-none h-10 w-10 border-none shrink-0"><Link href="/admin/cms"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="text-3xl font-headline font-normal">Edit FAQs</h1>
            <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Clinical Support Registry</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={addSection} className="h-12 px-6 uppercase text-[10px] font-bold tracking-widest border-primary text-primary hover:bg-primary hover:text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="h-12 px-10 shadow-xl shadow-primary/20 uppercase text-[11px] font-bold tracking-[0.2em]">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Commit Registry
          </Button>
        </div>
      </div>

      <div className="space-y-12">
        {sections.map((section, sIndex) => (
          <Card key={section.id || sIndex} className="border-none shadow-sm rounded-xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 flex flex-row items-center justify-between py-4 px-6">
              <div className="flex items-center gap-4 flex-1">
                <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-move" />
                <Input 
                  value={section.title} 
                  onChange={(e) => {
                    const next = [...sections];
                    next[sIndex].title = e.target.value;
                    setSections(next);
                  }}
                  className="bg-transparent border-none font-headline text-lg focus-visible:ring-0 p-0 h-auto"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeSection(sIndex)} className="text-destructive hover:bg-destructive/5"><Trash2 className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {(section.questions || []).map((q: any, qIndex: number) => (
                <div key={qIndex} className="p-6 bg-muted/10 rounded-xl relative group border border-transparent hover:border-primary/10 transition-all">
                  <Button variant="ghost" size="icon" onClick={() => removeQuestion(sIndex, qIndex)} className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Clinical Inquiry</Label>
                      <Input 
                        value={q.q} 
                        onChange={(e) => {
                          const next = [...sections];
                          next[sIndex].questions[qIndex].q = e.target.value;
                          setSections(next);
                        }}
                        className="bg-background border-none h-10 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Expert Response</Label>
                      <Textarea 
                        value={q.a} 
                        onChange={(e) => {
                          const next = [...sections];
                          next[sIndex].questions[qIndex].a = e.target.value;
                          setSections(next);
                        }}
                        className="bg-background border-none min-h-[80px] resize-none text-sm font-light leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" onClick={() => addQuestion(sIndex)} className="w-full border border-dashed border-primary/20 text-primary hover:bg-primary/5 uppercase text-[9px] font-bold tracking-widest h-12 rounded-xl">
                <Plus className="h-3 w-3 mr-2" /> Add Question Node
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
