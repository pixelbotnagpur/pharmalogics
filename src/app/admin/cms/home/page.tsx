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
  Zap, 
  Microscope,
  AlertCircle,
  Plus,
  Trash2,
  Stethoscope,
  Activity,
  HeartPulse,
  Search,
  Upload,
  Video,
  Image as ImageIcon,
  X,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { WebPage } from '@/lib/types';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'pharmlogics';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';

export default function EditHomePageCMS() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const pageRef = useMemoFirebase(() => doc(db, 'pages', 'home'), [db]);
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
      toast({ title: "CMS Node Updated", description: "Home page sections have been synchronized." });
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

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const cloudinaryData = new FormData();
        cloudinaryData.append('file', file);
        cloudinaryData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // Transitioned to /auto/upload to support Hybrid Media (Video/Image)
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
          method: 'POST',
          body: cloudinaryData,
        });

        if (!response.ok) {
          const errData = await response.json();
          console.error("Cloudinary Handshake Failure:", errData);
          throw new Error(errData?.error?.message || 'Upload failed');
        }

        const data = await response.json();
        updateSection(section, field, data.secure_url);
        toast({ title: "Asset Registered", description: "Clinical visual has been successfully uploaded and linked." });
      } catch (error: any) {
        console.error("Storage Logic Error:", error);
        toast({ 
          variant: "destructive", 
          title: "Storage Error", 
          description: error.message || "Could not upload asset to Cloudinary. Verify environment variables." 
        });
      } finally {
        setIsUploading(false);
      }
    }
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
          <h2 className="text-2xl font-headline">Home Registry Missing</h2>
          <p className="text-sm text-muted-foreground font-light max-w-sm">
            The clinical registry for the Home Page has not been provisioned in your cloud database.
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
            <h1 className="text-3xl font-headline font-normal">Edit Home Page</h1>
            <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Landing Node Management</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isUploading} className="h-12 px-10 shadow-xl shadow-primary/20 uppercase text-[11px] font-bold tracking-[0.2em] bg-primary text-white hover:bg-primary/90">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Commit Home Node
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="h-auto p-0 bg-transparent flex flex-wrap justify-start gap-2 mb-12">
          {[
            { value: 'hero', icon: Sparkles, label: 'Hero' },
            { value: 'narrative', icon: Zap, label: 'Narrative' },
            { value: 'science', icon: Microscope, label: 'Science' },
            { value: 'expert', icon: Stethoscope, label: 'Expert' },
            { value: 'comparison', icon: Activity, label: 'Comparison' },
            { value: 'commitment', icon: HeartPulse, label: 'Commitment' },
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
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Hero Node Configuration</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Main Title</Label>
                <Input value={content.hero?.title || ''} onChange={(e) => updateSection('hero', 'title', e.target.value)} className="h-12 bg-muted/20 border-none font-headline text-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Subtitle / Description</Label>
                <Textarea value={content.hero?.description || ''} onChange={(e) => updateSection('hero', 'description', e.target.value)} className="min-h-[100px] bg-muted/20 border-none leading-relaxed" />
              </div>
              
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <Video className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Primary Hero Visual Registry</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Asset Node (Image or MP4 URL)</Label>
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
                      *Supports high-resolution images or MP4 video files for a dynamic hero background.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Live Visual Node Preview</Label>
                    <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/10 relative">
                      {content.hero?.bgImageUrl ? (
                        content.hero.bgImageUrl.endsWith('.mp4') || content.hero.bgImageUrl.includes('video/upload') ? (
                          <video src={content.hero.bgImageUrl} className="h-full w-full object-cover" muted loop autoPlay />
                        ) : (
                          <img src={content.hero.bgImageUrl} className="h-full w-full object-cover" alt="Hero preview" />
                        )
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                          <ImageIcon className="h-8 w-8 mb-2" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">Awaiting Registry Asset</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">CTA Button Label</Label>
                  <Input value={content.hero?.ctaLabel || ''} onChange={(e) => updateSection('hero', 'ctaLabel', e.target.value)} className="h-12 bg-muted/20 border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">CTA Destination</Label>
                  <Input value={content.hero?.ctaHref || ''} onChange={(e) => updateSection('hero', 'ctaHref', e.target.value)} className="h-12 bg-muted/20 border-none" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="narrative" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Why We Exist Section</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Section Label</Label>
                <Input value={content.narrative?.label || ''} onChange={(e) => updateSection('narrative', 'label', e.target.value)} className="h-12 bg-muted/20 border-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Animated Reveal Text</Label>
                <Textarea value={content.narrative?.animatedText || ''} onChange={(e) => updateSection('narrative', 'animatedText', e.target.value)} className="min-h-[120px] bg-muted/20 border-none font-headline text-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Static Subtext</Label>
                <Textarea value={content.narrative?.subtext || ''} onChange={(e) => updateSection('narrative', 'subtext', e.target.value)} className="min-h-[80px] bg-muted/20 border-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">CTA Text</Label>
                  <Input value={content.narrative?.ctaLabel || ''} onChange={(e) => updateSection('narrative', 'ctaLabel', e.target.value)} className="h-12 bg-muted/20 border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">CTA Href</Label>
                  <Input value={content.narrative?.ctaHref || ''} onChange={(e) => updateSection('narrative', 'ctaHref', e.target.value)} className="h-12 bg-muted/20 border-none" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="science" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Science Section</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Section Label</Label><Input value={content.science?.label || ''} onChange={(e) => updateSection('science', 'label', e.target.value)} className="h-12 bg-muted/20 border-none" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Section Title</Label><Input value={content.science?.title || ''} onChange={(e) => updateSection('science', 'title', e.target.value)} className="h-12 bg-muted/20 border-none font-headline" /></div>
              </div>

              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <Video className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Science Visual Node Registry</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Asset Node (Image or MP4 URL)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={content.science?.visualUrl || ''} 
                        onChange={(e) => updateSection('science', 'visualUrl', e.target.value)} 
                        className="h-12 bg-background border-none text-xs flex-1" 
                        placeholder="https://..." 
                      />
                      <Label className="cursor-pointer flex items-center justify-center h-12 w-12 bg-primary text-white rounded-md hover:bg-primary/90 transition-all shrink-0">
                        <Upload className="h-4 w-4" />
                        <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'science', 'visualUrl')} />
                      </Label>
                    </div>
                    <p className="text-[8px] text-muted-foreground italic leading-relaxed">
                      *Replace the default laboratory loop with a custom high-integrity visual.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Live Visual Preview</Label>
                    <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/10 relative">
                      {content.science?.visualUrl ? (
                        content.science.visualUrl.endsWith('.mp4') || content.science.visualUrl.includes('video/upload') ? (
                          <video src={content.science.visualUrl} className="h-full w-full object-cover" muted loop autoPlay />
                        ) : (
                          <img src={content.science.visualUrl} className="h-full w-full object-cover" alt="Science preview" />
                        )
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                          <Video className="h-8 w-8 mb-2" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">Default Lab Loop Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Clinical Science Points</h4>
                  <button type="button" onClick={() => {
                    const newPoints = [...(content.science?.points || []), { title: 'New Point', description: '' }];
                    updateSection('science', 'points', newPoints);
                  }} className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Add Registry Node</button>
                </div>
                {(content.science?.points || []).map((point: any, i: number) => (
                  <div key={i} className="p-6 bg-muted/10 rounded-xl space-y-4 border border-transparent hover:border-primary/10 transition-all relative group">
                    <Button variant="ghost" size="icon" onClick={() => {
                      const newPoints = content.science.points.filter((_: any, idx: number) => idx !== i);
                      updateSection('science', 'points', newPoints);
                    }} className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></Button>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase">Point Title</Label>
                      <Input value={point.title || ''} onChange={(e) => {
                        const newPoints = [...content.science.points];
                        newPoints[i].title = e.target.value;
                        updateSection('science', 'points', newPoints);
                      }} className="h-10 bg-background border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase">Description</Label>
                      <Textarea value={point.description || ''} onChange={(e) => {
                        const newPoints = [...content.science.points];
                        newPoints[i].description = e.target.value;
                        updateSection('science', 'points', newPoints);
                      }} className="min-h-[80px] bg-background border-none text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expert" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Expert Validation Registry</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Label</Label><Input value={content.expert?.label || ''} onChange={(e) => updateSection('expert', 'label', e.target.value)} className="h-12 bg-muted/20 border-none" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Title</Label><Input value={content.expert?.title || ''} onChange={(e) => updateSection('expert', 'title', e.target.value)} className="h-12 bg-muted/20 border-none font-headline" /></div>
              </div>
              <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Description</Label><Textarea value={content.expert?.description || ''} onChange={(e) => updateSection('expert', 'description', e.target.value)} className="h-24 bg-muted/20 border-none" /></div>
              
              {/* Asset Management Block */}
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-8">
                <div className="flex items-center gap-2 text-primary">
                  <User className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Expert Visual Identity Nodes</span>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  {/* Avatar Node */}
                  <div className="space-y-4">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Expert Avatar (Circular Profile)</Label>
                    <div className="flex items-center gap-6">
                      <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted/10 shrink-0">
                        {content.expert?.avatarUrl ? <img src={content.expert.avatarUrl} className="h-full w-full object-cover" /> : <ImageIcon className="h-full w-full p-6 opacity-20" />}
                      </div>
                      <div className="flex-1 space-y-3">
                        <Label className="cursor-pointer flex items-center justify-center h-11 bg-primary text-white rounded-md hover:bg-primary/90 transition-all font-bold text-[10px] uppercase tracking-widest">
                          <Upload className="h-3 w-3 mr-2" /> Upload Avatar
                          <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'expert', 'avatarUrl')} />
                        </Label>
                        <Input value={content.expert?.avatarUrl || ''} onChange={(e) => updateSection('expert', 'avatarUrl', e.target.value)} className="h-9 bg-background border-none text-[10px]" placeholder="Asset URL" />
                      </div>
                    </div>
                  </div>

                  {/* Main Lifestyle Node */}
                  <div className="space-y-4">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Main Section Visual (Editorial)</Label>
                    <div className="space-y-4">
                      <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/10">
                        {content.expert?.mainImageUrl ? <img src={content.expert.mainImageUrl} className="h-full w-full object-cover" /> : <ImageIcon className="h-full w-full p-12 opacity-10" />}
                      </div>
                      <Label className="cursor-pointer flex items-center justify-center h-11 bg-primary text-white rounded-md hover:bg-primary/90 transition-all font-bold text-[10px] uppercase tracking-widest">
                        <Upload className="h-3 w-3 mr-2" /> Upload Main Image
                        <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'expert', 'mainImageUrl')} />
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/10 rounded-xl space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Testimonial Protocol</h4>
                <div className="space-y-4">
                  <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Quote Text</Label><Textarea value={content.expert?.quote || ''} onChange={(e) => updateSection('expert', 'quote', e.target.value)} className="min-h-[120px] bg-background border-none italic" /></div>
                  <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Author & Credentials</Label><Input value={content.expert?.author || ''} onChange={(e) => updateSection('expert', 'author', e.target.value)} className="h-12 bg-background border-none font-bold" /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Bio-Delivery Comparison</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Main Title</Label><Input value={content.comparison?.title || ''} onChange={(e) => updateSection('comparison', 'title', e.target.value)} className="h-12 bg-muted/20 border-none font-headline" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Description</Label><Input value={content.comparison?.description || ''} onChange={(e) => updateSection('comparison', 'description', e.target.value)} className="h-12 bg-muted/20 border-none" /></div>
              </div>

              {/* Asset Management Block */}
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-8">
                <div className="flex items-center gap-2 text-primary">
                  <ImageIcon className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Comparison Module Visual Registry</span>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  {/* Module Background */}
                  <div className="space-y-4">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Module Background (Overlay)</Label>
                    <div className="space-y-4">
                      <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/10">
                        {content.comparison?.bgImageUrl ? <img src={content.comparison.bgImageUrl} className="h-full w-full object-cover opacity-40" /> : <ImageIcon className="h-full w-full p-12 opacity-10" />}
                      </div>
                      <Label className="cursor-pointer flex items-center justify-center h-11 bg-primary text-white rounded-md hover:bg-primary/90 transition-all font-bold text-[10px] uppercase tracking-widest">
                        <Upload className="h-3 w-3 mr-2" /> Upload Background
                        <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'comparison', 'bgImageUrl')} />
                      </Label>
                    </div>
                  </div>

                  {/* Subject Portrait */}
                  <div className="space-y-4">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Subject Portrait (Portrait Crop)</Label>
                    <div className="space-y-4">
                      <div className="aspect-[3/4] w-full max-w-[200px] mx-auto rounded-xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/10">
                        {content.comparison?.personImageUrl ? <img src={content.comparison.personImageUrl} className="h-full w-full object-cover grayscale" /> : <User className="h-full w-full p-12 opacity-10" />}
                      </div>
                      <Label className="cursor-pointer flex items-center justify-center h-11 bg-primary text-white rounded-md hover:bg-primary/90 transition-all font-bold text-[10px] uppercase tracking-widest">
                        <Upload className="h-3 w-3 mr-2" /> Upload Portrait
                        <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'comparison', 'personImageUrl')} />
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Comparison Matrix Rows</h4>
                  <button type="button" onClick={() => {
                    const newRows = [...(content.comparison?.rows || []), { feature: 'New Feature', capsule: 'Yes', iv: 'No' }];
                    updateSection('comparison', 'rows', newRows);
                  }} className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Add Row Node</button>
                </div>
                <div className="space-y-3">
                  {(content.comparison?.rows || []).map((row: any, i: number) => (
                    <div key={i} className="grid grid-cols-12 gap-4 items-center p-3 bg-muted/10 rounded-lg group">
                      <div className="col-span-5"><Input value={row.feature} onChange={(e) => { const next = [...content.comparison.rows]; next[i].feature = e.target.value; updateSection('comparison', 'rows', next); }} className="h-9 bg-background border-none text-xs font-bold" /></div>
                      <div className="col-span-3"><Input value={row.capsule} onChange={(e) => { const next = [...content.comparison.rows]; next[i].capsule = e.target.value; updateSection('comparison', 'rows', next); }} className="h-9 bg-background border-none text-xs text-center" /></div>
                      <div className="col-span-3"><Input value={row.iv} onChange={(e) => { const next = [...content.comparison.rows]; next[i].iv = e.target.value; updateSection('comparison', 'rows', next); }} className="h-9 bg-background border-none text-xs text-center" /></div>
                      <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => { const next = content.comparison.rows.filter((_: any, idx: number) => idx !== i); updateSection('comparison', 'rows', next); }} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></Button></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commitment" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Core Commitments Registry</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Section Label</Label><Input value={content.commitment?.label || ''} onChange={(e) => updateSection('commitment', 'label', e.target.value)} className="h-12 bg-muted/20 border-none" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Section Title</Label><Input value={content.commitment?.title || ''} onChange={(e) => updateSection('commitment', 'title', e.target.value)} className="h-12 bg-muted/20 border-none font-headline" /></div>
              </div>
              <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Description</Label><Textarea value={content.commitment?.description || ''} onChange={(e) => updateSection('commitment', 'description', e.target.value)} className="h-24 bg-muted/20 border-none" /></div>
              <div className="grid md:grid-cols-2 gap-6">
                {(content.commitment?.benefits || []).map((benefit: any, i: number) => (
                  <div key={i} className="p-6 bg-muted/10 rounded-xl space-y-4 relative group border border-transparent hover:border-primary/10">
                    <Button variant="ghost" size="icon" onClick={() => { const next = content.commitment.benefits.filter((_: any, idx: number) => idx !== i); updateSection('commitment', 'benefits', next); }} className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                    <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Benefit Title</Label><Input value={benefit.title} onChange={(e) => { const next = [...content.commitment.benefits]; next[i].title = e.target.value; updateSection('commitment', 'benefits', next); }} className="h-10 bg-background border-none font-bold" /></div>
                    <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Description</Label><Textarea value={benefit.description} onChange={(e) => { const next = [...content.commitment.benefits]; next[i].description = e.target.value; updateSection('commitment', 'benefits', next); }} className="min-h-[80px] bg-background border-none text-xs" /></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6"><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Search Engine Optimization</CardTitle></CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Meta Title (Suffix added automatically)</Label>
                <Input 
                  value={content.seo?.title || ''} 
                  onChange={(e) => updateSection('seo', 'title', e.target.value)} 
                  className="h-12 bg-muted/20 border-none"
                  placeholder="e.g. Pure clinical excellence" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Meta Description</Label>
                <Textarea 
                  value={content.seo?.description || ''} 
                  onChange={(e) => updateSection('seo', 'description', e.target.value)} 
                  className="min-h-[120px] bg-muted/20 border-none leading-relaxed" 
                  placeholder="Summarize the clinical purpose of this page for search results..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
