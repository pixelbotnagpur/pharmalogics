'use client';

import { useForm } from 'react-hook-form';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Upload, 
  Tag,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'pharmlogics';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slugs must be lowercase, numbers, and dashes only"),
  description: z.string().min(10, "Description is required"),
  imageSrc: z.string().min(1, "Asset is required"),
  imageHint: z.string().min(1, "Hint is required"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional()
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: any;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
  title: string;
}

export function CategoryForm({ initialData, onSubmit, isLoading, title }: CategoryFormProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ? {
      name: initialData.name || '',
      slug: initialData.slug || '',
      description: initialData.description || '',
      imageSrc: initialData.imageSrc || '',
      imageHint: initialData.imageHint || 'category abstract',
      seoTitle: initialData.seoTitle || '',
      seoDescription: initialData.seoDescription || 'clinical taxonomy node'
    } : {
      name: '',
      slug: '',
      description: '',
      imageSrc: '',
      imageHint: 'category abstract',
      seoTitle: '',
      seoDescription: ''
    }
  });

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // Transitioned to /auto for universal support
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
        toast({ title: "Node Visual Synchronized", description: "Category asset has been uploaded to Cloudinary." });
      } catch (error: any) {
        console.error("Taxonomy Asset Error:", error);
        toast({ 
          variant: "destructive", 
          title: "Storage Error", 
          description: error.message || "Could not upload taxonomy asset to Cloudinary. Check your configuration." 
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-8 pb-20 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="accent" size="icon" asChild className="rounded-none h-10 w-10 border-none shrink-0">
            <Link href="/admin/categories"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-3xl font-headline font-normal truncate">{title}</h1>
            <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Taxonomy Node Management</p>
          </div>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading || isUploading} className="h-12 px-10 shadow-xl shadow-primary/20 uppercase text-[11px] font-bold tracking-[0.2em] shrink-0 bg-primary text-white">
          {(isLoading || isUploading) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {isUploading ? 'Uploading Visuals...' : 'Commit Category'}
        </Button>
      </div>

      <Form {...form}>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Tag className="h-3 w-3" /> Node Definition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Display Name</FormLabel>
                      <FormControl><Input className="h-12 bg-muted/20 border-none" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest">URL Slug</FormLabel>
                      <FormControl><Input placeholder="e.g. heart-brain" className="h-12 bg-muted/20 border-none" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Registry Description</FormLabel>
                    <FormControl><Textarea className="min-h-[120px] resize-none bg-muted/20 border-none" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Globe className="h-3 w-3" /> Collection Search Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <FormField control={form.control} name="seoTitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest">SEO Meta Title</FormLabel>
                    <FormControl><Input className="h-12 bg-muted/20 border-none" placeholder="e.g. Clinical Solutions for Cognitive Performance" {...field} /></FormControl>
                    <FormDescription className="text-[10px]">Defaults to the category name if empty.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="seoDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest">SEO Meta Description</FormLabel>
                    <FormControl><Textarea className="min-h-[100px] resize-none bg-muted/20 border-none leading-relaxed" placeholder="A compelling summary for search result rankings..." {...field} /></FormControl>
                    <FormDescription className="text-[10px]">Defaults to the description if empty.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-primary/10 pb-4">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Taxonomy Visuals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <FormField control={form.control} name="imageSrc" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Node Visual Asset</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <label className="cursor-pointer flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
                          <Upload className="h-6 w-6 text-primary mb-2" />
                          <span className="text-[9px] font-bold uppercase text-primary">Upload Asset</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e, field.onChange)} />
                        </label>
                        {field.value && (
                          <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-muted/10">
                            <img src={field.value} alt="Preview" className="h-full w-full object-contain p-4" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="imageHint" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Asset Hint</FormLabel>
                    <FormControl><Input className="h-12 bg-muted/20 border-none" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
