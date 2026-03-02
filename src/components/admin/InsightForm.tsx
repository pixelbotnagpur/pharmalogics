'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Upload, 
  BookOpen, 
  Microscope,
  Activity,
  Plus,
  Trash2,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'pharmlogics';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';

const insightSchema = z.object({
  title: z.string().min(5, "Title is required"),
  excerpt: z.string().min(10, "Excerpt is required"),
  category: z.enum(["RESEARCH", "CLINICAL", "OPTIMIZATION"]),
  imageUrl: z.string().min(1, "Visual asset is required"),
  imageHint: z.string().min(1, "Asset hint is required"),
  readTime: z.string().min(1, "Read time is required"),
  authorName: z.string().min(1, "Author name required"),
  authorTitle: z.string().min(1, "Author title required"),
  date: z.string().min(1, "Date required"),
  published: z.boolean().default(true),
  content: z.array(z.object({ value: z.string().min(1) })).min(1, "At least one content paragraph is required")
});

type InsightFormValues = z.infer<typeof insightSchema>;

interface InsightFormProps {
  initialData?: any;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
  title: string;
}

export function InsightForm({ initialData, onSubmit, isLoading, title }: InsightFormProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<InsightFormValues>({
    resolver: zodResolver(insightSchema),
    defaultValues: initialData ? {
      title: initialData.title || '',
      excerpt: initialData.excerpt || '',
      category: initialData.category || 'RESEARCH',
      imageUrl: initialData.imageUrl || '',
      imageHint: initialData.imageHint || 'clinical research',
      readTime: initialData.readTime || '5 MIN READ',
      authorName: initialData.authorName || 'Dr. Elena Thorne',
      authorTitle: initialData.authorTitle || 'Lead Molecular Biologist',
      date: initialData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
      published: initialData.published ?? true,
      content: initialData.content?.map((v: string) => ({ value: v })) || [{ value: '' }]
    } : {
      title: '',
      excerpt: '',
      category: 'RESEARCH',
      imageUrl: '',
      imageHint: 'clinical research',
      readTime: '5 MIN READ',
      authorName: 'Dr. Elena Thorne',
      authorTitle: 'Lead Molecular Biologist',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
      published: true,
      content: [{ value: '' }]
    }
  });

  const { fields: contentFields, append: appendContent, remove: removeContent } = useFieldArray({
    control: form.control,
    name: "content"
  });

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // Hybrid media endpoint support
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData?.error?.message || 'Upload failed');
        }

        const data = await response.json();
        onChange(data.secure_url);
        toast({ title: "Visual Node Synchronized", description: "Insight asset has been uploaded." });
      } catch (error: any) {
        console.error("Insight Asset Logic Error:", error);
        toast({ 
          variant: "destructive", 
          title: "Storage Error", 
          description: error.message || "Could not upload asset to Cloudinary. Check your configuration." 
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFinalSubmit = (data: InsightFormValues) => {
    const formatted = {
      ...data,
      content: data.content.map(c => c.value),
      updatedAt: new Date().toISOString()
    };
    onSubmit(formatted);
  };

  return (
    <div className="space-y-8 pb-20 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Button variant="accent" size="icon" asChild className="rounded-none h-10 w-10 border-none shrink-0">
            <Link href="/admin/insights"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-3xl font-headline font-normal truncate">{title}</h1>
            <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Research Registry Node</p>
          </div>
        </div>
        <Button onClick={form.handleSubmit(handleFinalSubmit)} disabled={isLoading || isUploading} className="h-12 px-10 shadow-xl shadow-primary/20 uppercase text-[11px] font-bold tracking-[0.2em] bg-primary text-white">
          {(isLoading || isUploading) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Commit Protocol
        </Button>
      </div>

      <Form {...form}>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2"><BookOpen className="h-3 w-3" /> Abstract Identity</CardTitle></CardHeader>
              <CardContent className="space-y-6 pt-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Research Title</FormLabel><FormControl><Input className="h-12 bg-muted/20 border-none font-headline text-lg" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="excerpt" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Log Summary (Excerpt)</FormLabel><FormControl><Textarea className="min-h-[100px] resize-none bg-muted/20 border-none leading-relaxed" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Protocol Content</CardTitle><Button type="button" variant="outline" size="sm" onClick={() => appendContent({ value: '' })} className="h-8 text-[9px] font-bold"><Plus className="h-3 w-3 mr-1" /> ADD PARAGRAPH</Button></CardHeader>
              <CardContent className="pt-6 space-y-6">
                {contentFields.map((field, index) => (
                  <div key={field.id} className="relative group">
                    <FormField control={form.control} name={`content.${index}.value`} render={({ field }) => (
                      <FormItem><FormControl><Textarea className="min-h-[150px] resize-none bg-muted/10 border-none leading-relaxed p-6 text-sm font-light" placeholder={`Paragraph ${index + 1}...`} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeContent(index)} className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-primary/5">
              <CardHeader className="bg-primary/10 pb-4"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Microscope className="h-3 w-3" /> Taxonomy & Metadata</CardTitle></CardHeader>
              <CardContent className="space-y-6 pt-6">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Clinical Classification</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12 bg-card border-none"><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="RESEARCH" className="text-xs uppercase">Research</SelectItem>
                        <SelectItem value="CLINICAL" className="text-xs uppercase">Clinical</SelectItem>
                        <SelectItem value="OPTIMIZATION" className="text-xs uppercase">Optimization</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="readTime" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Read Duration</FormLabel><div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" /><Input className="h-12 pl-10 bg-card border-none text-xs" {...field} /></div></FormItem>
                  )} />
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Registry Date</FormLabel><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" /><Input className="h-12 pl-10 bg-card border-none text-xs" {...field} /></div></FormItem>
                  )} />
                </div>

                <div className="space-y-4">
                  <FormField control={form.control} name="authorName" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Lead Researcher</FormLabel><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" /><Input className="h-12 pl-10 bg-card border-none text-xs" {...field} /></div></FormItem>
                  )} />
                  <FormField control={form.control} name="authorTitle" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Researcher Title</FormLabel><FormControl><Input className="h-12 bg-card border-none text-[10px]" {...field} /></FormControl></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="published" render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
                    <div className="space-y-0.5"><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Live Registry</FormLabel><p className="text-[9px] text-muted-foreground uppercase font-light">Visible to public storefront</p></div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Log Visual Asset</CardTitle></CardHeader>
              <CardContent className="space-y-6 pt-6">
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-4">
                        <label className="cursor-pointer flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
                          <Upload className="h-6 w-6 text-primary mb-2" />
                          <span className="text-[9px] font-bold uppercase text-primary">Upload Clinical Asset</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e, field.onChange)} />
                        </label>
                        {field.value && (
                          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border bg-muted/10">
                            <img src={field.value} alt="Insight visual preview" className="h-full w-full object-cover grayscale opacity-60" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="imageHint" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">A.I. Search Keywords</FormLabel><FormControl><Input className="h-12 bg-muted/20 border-none" {...field} /></FormControl></FormItem>
                )} />
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
