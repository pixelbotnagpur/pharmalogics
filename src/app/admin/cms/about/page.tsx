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
  Layers, 
  Users, 
  BookOpen, 
  MessageCircle,
  Activity,
  Stethoscope,
  AlertCircle,
  Search,
  Upload,
  Video,
  X,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { WebPage } from '@/lib/types';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'pharmlogics';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';

export default function EditAboutPageCMS() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const pageRef = useMemoFirebase(() => doc(db, 'pages', 'about'), [db]);
  const { data: pageData, isLoading } = useDoc<WebPage>(pageRef);

  const [content, setContent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
      toast({ title: "CMS Node Updated", description: "About page sections have been synchronized." });
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

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string, field: string, index?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const cloudinaryData = new FormData();
        cloudinaryData.append('file', file);
        cloudinaryData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // Universal autodetect endpoint
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
          method: 'POST',
          body: cloudinaryData,
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData?.error?.message || 'Upload failed');
        }

        const data = await response.json();

        if (index !== undefined) {
          // Handle nested list item update (e.g. Values icon)
          const newItems = [...content[section].items];
          if (section === 'values') {
            newItems[index] = {
              ...newItems[index],
              icon: {
                imageUrl: data.secure_url,
                imageHint: newItems[index].title?.toLowerCase() || 'value icon'
              }
            };
          }
          updateSection(section, 'items', newItems);
        } else {
          // Handle top-level field update
          updateSection(section, field, data.secure_url);
        }

        toast({ title: "Asset Registered", description: "Visual has been successfully uploaded and linked." });
      } catch (error: any) {
        console.error("Upload failed:", error);
        toast({ 
          variant: "destructive", 
          title: "Storage Error", 
          description: error.message || "Could not upload asset to Cloudinary." 
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const updateParagraph = (section: string, index: number, value: string) => {
    if (!content[section]?.paragraphs) return;
    const newParagraphs = [...content[section].paragraphs];
    newParagraphs[index] = value;
    updateSection(section, 'paragraphs', newParagraphs);
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
          <h2 className="text-2xl font-headline">Registry Node Missing</h2>
          <p className="text-sm text-muted-foreground font-light max-w-sm">
            The clinical registry for the About Page has not been provisioned in your cloud database.
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
            <h1 className="text-3xl font-headline font-normal">Edit About Page</h1>
            <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Sectioned Content Registry</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isUploading} className="h-12 px-10 shadow-xl shadow-primary/20 uppercase text-[11px] font-bold tracking-[0.2em] bg-primary text-white hover:bg-primary/90">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Commit Changes
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="h-auto p-0 bg-transparent flex flex-wrap justify-start gap-2 mb-12">
          {[
            { value: 'hero', icon: Sparkles, label: 'Hero' },
            { value: 'story', icon: BookOpen, label: 'Story' },
            { value: 'values', icon: Activity, label: 'Values' },
            { value: 'ethos', icon: Layers, label: 'Ethos' },
            { value: 'editorial', icon: Stethoscope, label: 'Editorial' },
            { value: 'community', icon: Users, label: 'Community' },
            { value: 'seo', icon: Search, label: 'SEO' },
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
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Hero Configuration</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Mission Label</Label>
                <Input value={content.hero?.missionLabel || ''} onChange={(e) => updateSection('hero', 'missionLabel', e.target.value)} className="h-12 bg-muted/20 border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Main Title</Label>
                <Input value={content.hero?.title || ''} onChange={(e) => updateSection('hero', 'title', e.target.value)} className="h-12 bg-muted/20 border-none font-headline text-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Description</Label>
                <Textarea value={content.hero?.description || ''} onChange={(e) => updateSection('hero', 'description', e.target.value)} className="min-h-[100px] bg-muted/20 border-none leading-relaxed" />
              </div>
              
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <Video className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Primary Hero Visual Node</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Registry Override (URL or Upload)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={content.hero?.bgImageUrl || ''} 
                        onChange={(e) => updateSection('hero', 'bgImageUrl', e.target.value)} 
                        className="h-12 bg-background border-none text-xs flex-1" 
                        placeholder="https://..." 
                      />
                      <Label className="cursor-pointer flex items-center justify-center h-12 w-12 bg-primary text-white rounded-md hover:bg-primary/90 transition-all shrink-0">
                        <Upload className="h-4 w-4" />
                        <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'hero', 'bgImageUrl')} />
                      </Label>
                    </div>
                    <p className="text-[8px] text-muted-foreground italic leading-relaxed">
                      *Supports high-resolution images or MP4 video files for an editorial background effect.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Live Visual Preview</Label>
                    <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/10 relative">
                      {content.hero?.bgImageUrl ? (
                        content.hero.bgImageUrl.endsWith('.mp4') || content.hero.bgImageUrl.includes('video/upload') ? (
                          <video src={content.hero.bgImageUrl} className="h-full w-full object-cover" muted loop autoPlay />
                        ) : (
                          <img src={content.hero.bgImageUrl} className="h-full w-full object-cover" alt="About Hero preview" />
                        )
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                          <ImageIcon className="h-8 w-8 mb-2" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">Awaiting Visual Asset</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="story" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-8">
              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Narrative & Title</CardTitle></CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Label</Label><Input value={content.story?.label || ''} onChange={(e) => updateSection('story', 'label', e.target.value)} className="h-12 bg-muted/20 border-none" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Title</Label><Input value={content.story?.title || ''} onChange={(e) => updateSection('story', 'title', e.target.value)} className="h-12 bg-muted/20 border-none font-headline" /></div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Body Paragraphs</Label>
                    {(content.story?.paragraphs || []).map((p: string, i: number) => (
                      <Textarea key={i} value={p} onChange={(e) => updateParagraph('story', i, e.target.value)} className="min-h-[120px] bg-muted/20 border-none text-sm leading-relaxed" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-4">
              <Card className="border-none shadow-sm bg-primary/5 rounded-xl overflow-hidden h-full">
                <CardHeader className="bg-primary/10 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Feature Quote</CardTitle></CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Quote Text</Label>
                    <Textarea value={content.story?.quote || ''} onChange={(e) => updateSection('story', 'quote', e.target.value)} className="min-h-[150px] bg-card border-none font-headline text-lg italic leading-tight" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Attribution</Label>
                    <Input value={content.story?.author || ''} onChange={(e) => updateSection('story', 'author', e.target.value)} className="h-12 bg-card border-none font-bold text-xs" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="values" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Core Pillars</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Section Label</Label>
                <Input value={content.values?.label || ''} onChange={(e) => updateSection('values', 'label', e.target.value)} className="h-12 bg-muted/20 border-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(content.values?.items || []).map((value: any, i: number) => (
                  <div key={i} className="p-6 bg-muted/10 rounded-xl space-y-6 border border-transparent hover:border-primary/10 transition-all">
                    <div className="flex items-start gap-6">
                      <div className="space-y-3 shrink-0">
                        <Label className="text-[9px] font-bold uppercase">Icon Node</Label>
                        <div className="h-24 w-24 rounded-lg overflow-hidden border-2 border-dashed border-primary/20 bg-background relative group/icon">
                          {value.icon?.imageUrl ? (
                            <img src={value.icon.imageUrl} className="h-full w-full object-cover" alt="Icon preview" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center opacity-20"><ImageIcon className="h-6 w-6" /></div>
                          )}
                          <label className="absolute inset-0 bg-primary/60 text-white flex items-center justify-center opacity-0 group-hover/icon:opacity-100 cursor-pointer transition-opacity">
                            <Upload className="h-4 w-4" />
                            <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'values', 'icon', i)} />
                          </label>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase">Value Title</Label>
                          <Input value={value.title || ''} onChange={(e) => {
                            const newItems = [...content.values.items];
                            newItems[i].title = e.target.value;
                            updateSection('values', 'items', newItems);
                          }} className="h-10 bg-background border-none" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase">Short Description</Label>
                          <Textarea value={value.description || ''} onChange={(e) => {
                            const newItems = [...content.values.items];
                            newItems[i].description = e.target.value;
                            updateSection('values', 'items', newItems);
                          }} className="min-h-[80px] bg-background border-none text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ethos" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Ethos & Commitments</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Section Label</Label><Input value={content.ethos?.label || ''} onChange={(e) => updateSection('ethos', 'label', e.target.value)} className="h-12 bg-muted/20 border-none" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Section Title</Label><Input value={content.ethos?.title || ''} onChange={(e) => updateSection('ethos', 'title', e.target.value)} className="h-12 bg-muted/20 border-none font-headline" /></div>
              </div>

              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <ImageIcon className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Ethos Visual Asset Registry</span>
                </div>
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Asset Override (URL or Upload)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={content.ethos?.imageUrl || ''} 
                        onChange={(e) => updateSection('ethos', 'imageUrl', e.target.value)} 
                        className="h-12 bg-background border-none text-xs flex-1" 
                        placeholder="https://..." 
                      />
                      <Label className="cursor-pointer flex items-center justify-center h-12 w-12 bg-primary text-white rounded-md hover:bg-primary/90 transition-all shrink-0">
                        <Upload className="h-4 w-4" />
                        <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'ethos', 'imageUrl')} />
                      </Label>
                    </div>
                  </div>
                  <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/10 relative">
                    {content.ethos?.imageUrl ? (
                      <img src={content.ethos.imageUrl} className="h-full w-full object-cover" alt="Ethos preview" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                        <ImageIcon className="h-8 w-8 mb-2" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Awaiting Visual Node</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between"><h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Impact Items</h4></div>
                {(content.ethos?.items || []).map((item: any, i: number) => (
                  <div key={i} className="p-6 bg-muted/10 rounded-xl space-y-4 border border-transparent hover:border-primary/10 transition-all">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Item Title</Label><Input value={item.title || ''} onChange={(e) => {
                        const newItems = [...content.ethos.items];
                        newItems[i].title = e.target.value;
                        updateSection('ethos', 'items', newItems);
                      }} className="h-10 bg-background border-none" /></div>
                      <div className="md:col-span-2 space-y-2"><Label className="text-[9px] font-bold uppercase">Description</Label><Textarea value={item.content || ''} onChange={(e) => {
                        const newItems = [...content.ethos.items];
                        newItems[i].content = e.target.value;
                        updateSection('ethos', 'items', newItems);
                      }} className="min-h-[80px] bg-background border-none text-xs" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editorial" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Editorial Oversight</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Section Headline</Label>
                <Input value={content.editorial?.title || ''} onChange={(e) => updateSection('editorial', 'title', e.target.value)} className="h-12 bg-muted/20 border-none font-headline" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Scientific Content</Label>
                <Textarea value={content.editorial?.content || ''} onChange={(e) => updateSection('editorial', 'content', e.target.value)} className="min-h-[150px] bg-muted/20 border-none leading-relaxed" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Community Impact</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Label</Label><Input value={content.community?.label || ''} onChange={(e) => updateSection('community', 'label', e.target.value)} className="h-12 bg-muted/20 border-none" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Title</Label><Input value={content.community?.title || ''} onChange={(e) => updateSection('community', 'title', e.target.value)} className="h-12 bg-muted/20 border-none font-headline" /></div>
              </div>

              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <ImageIcon className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Community Visual Asset Registry</span>
                </div>
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Asset Override (URL or Upload)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={content.community?.imageUrl || ''} 
                        onChange={(e) => updateSection('community', 'imageUrl', e.target.value)} 
                        className="h-12 bg-background border-none text-xs flex-1" 
                        placeholder="https://..." 
                      />
                      <Label className="cursor-pointer flex items-center justify-center h-12 w-12 bg-primary text-white rounded-md hover:bg-primary/90 transition-all shrink-0">
                        <Upload className="h-4 w-4" />
                        <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'community', 'imageUrl')} />
                      </Label>
                    </div>
                  </div>
                  <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/10 relative">
                    {content.community?.imageUrl ? (
                      <img src={content.community.imageUrl} className="h-full w-full object-cover" alt="Community preview" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                        <ImageIcon className="h-8 w-8 mb-2" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Awaiting Visual Node</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Paragraphs</Label>
                {(content.community?.paragraphs || []).map((p: string, i: number) => (
                  <div key={i} className="relative group">
                    <Textarea value={p} onChange={(e) => {
                      const newP = [...content.community.paragraphs];
                      newP[i] = e.target.value;
                      updateSection('community', 'paragraphs', newP);
                    }} className="min-h-[100px] bg-muted/20 border-none text-sm leading-relaxed" />
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">CTA Text</Label><Input value={content.community?.ctaLabel || ''} onChange={(e) => updateSection('community', 'ctaLabel', e.target.value)} className="h-12 bg-muted/20 border-none" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">CTA Href</Label><Input value={content.community?.ctaHref || ''} onChange={(e) => updateSection('community', 'ctaHref', e.target.value)} className="h-12 bg-muted/20 border-none" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Search Engine Optimization</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Meta Title</Label>
                <Input 
                  value={content.seo?.title || ''} 
                  onChange={(e) => updateSection('seo', 'title', e.target.value)} 
                  className="h-12 bg-muted/20 border-none"
                  placeholder="e.g. Our Story and Science" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Meta Description</Label>
                <Textarea 
                  value={content.seo?.description || ''} 
                  onChange={(e) => updateSection('seo', 'description', e.target.value)} 
                  className="min-h-[120px] bg-muted/20 border-none leading-relaxed" 
                  placeholder="Learn how Pharmlogics is engineering the future of wellness..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
