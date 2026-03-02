'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useMemo } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Upload, 
  Layers, 
  Package, 
  Check, 
  Search,
  X,
  ChevronsUpDown,
  Tag,
  Sparkles,
  Globe,
  Stethoscope,
  Activity,
  Box,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import type { Product, Category, StoreSettings } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirestore, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { generateProductDescription } from '@/ai/flows/ai-product-description-generator';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'pharmlogics';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(2, "SKU is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  subscriptionDiscount: z.coerce.number().min(0).max(100).default(30),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description is required"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  imageUrl: z.string().min(1, "Asset is required"),
  imageHint: z.string().min(1, "Hint is required"),
  dosage: z.string().min(5, "Dosage info is required"),
  benefits: z.string(),
  ingredients: z.string(),
  flavor: z.string().optional(),
  includedItems: z.array(z.string()).default([]),
  gallery: z.array(z.object({
    imageUrl: z.string().min(1, "Asset is required"),
    imageHint: z.string().min(1, "Hint required")
  })),
  availablePacks: z.array(z.object({
    label: z.string().min(1),
    count: z.coerce.number().min(1),
    discountMultiplier: z.coerce.number().min(0).max(1)
  })),
  detailedBenefits: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1)
  })),
  usageInstructions: z.array(z.object({
    value: z.string().min(1)
  })),
  deliveryInfo: z.string().optional(),
  sustainabilityInfo: z.string().optional(),
  featuredIngredients: z.array(z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    imageUrl: z.string().min(1),
    imageHint: z.string()
  })),
  fullIngredientsList: z.array(z.object({
    name: z.string().min(1),
    amount: z.string().min(1)
  })),
  advantageSection: z.object({
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      imageUrl: z.string().min(1),
      imageHint: z.string()
    }))
  }),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
  title: string;
  allProducts?: Product[];
}

export function ProductForm({ initialData, onSubmit, isLoading, title, allProducts = [] }: ProductFormProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);
  const { data: categories } = useCollection<Category>(categoriesQuery);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      name: initialData.name || '',
      sku: initialData.sku || '',
      price: initialData.price || 59.99,
      subscriptionDiscount: initialData.subscriptionDiscount ?? 30,
      category: initialData.category || '',
      description: initialData.description || '',
      stock: initialData.stock ?? 100,
      imageUrl: initialData.imageUrl || '',
      imageHint: initialData.imageHint || 'supplement bottle',
      dosage: initialData.dosage || 'Take 2 capsules daily.',
      flavor: initialData.flavor || 'Unflavored',
      benefits: Array.isArray(initialData.benefits) ? initialData.benefits.join(', ') : (initialData.benefits || ''),
      ingredients: Array.isArray(initialData.ingredients) ? initialData.ingredients.join(', ') : (initialData.ingredients || ''),
      includedItems: Array.isArray(initialData.includedItems) ? initialData.includedItems : [],
      gallery: Array.isArray(initialData.gallery) ? initialData.gallery : [],
      availablePacks: Array.isArray(initialData.availablePacks) ? initialData.availablePacks : [
        { label: 'Single', count: 1, discountMultiplier: 1 },
        { label: '3-Pack', count: 3, discountMultiplier: 0.9 },
        { label: '6-Pack', count: 6, discountMultiplier: 0.8 },
      ],
      detailedBenefits: Array.isArray(initialData.detailedBenefits) ? initialData.detailedBenefits : [],
      usageInstructions: Array.isArray(initialData.usageInstructions) ? initialData.usageInstructions.map((v: any) => ({ value: typeof v === 'string' ? v : (v.value || '') })) : [],
      deliveryInfo: initialData.deliveryInfo || 'Free shipping on all orders over $50. Orders are processed within 1-2 business days.',
      sustainabilityInfo: initialData.sustainabilityInfo || 'Our packaging is made with 80% less material than traditional bottles.',
      featuredIngredients: Array.isArray(initialData.featuredIngredients) ? initialData.featuredIngredients : [],
      fullIngredientsList: Array.isArray(initialData.fullIngredientsList) ? initialData.fullIngredientsList : [],
      advantageSection: initialData.advantageSection || { items: [] },
      seoTitle: initialData.seoTitle || '',
      seoDescription: initialData.seoDescription || ''
    } : {
      name: '',
      sku: '',
      price: 59.99,
      subscriptionDiscount: 30,
      category: '',
      description: '',
      stock: 100,
      imageUrl: '',
      imageHint: 'supplement bottle',
      dosage: 'Take 2 capsules daily.',
      benefits: '',
      ingredients: '',
      flavor: 'Unflavored',
      includedItems: [],
      gallery: [],
      availablePacks: [
        { label: 'Single', count: 1, discountMultiplier: 1 },
        { label: '3-Pack', count: 3, discountMultiplier: 0.9 },
        { label: '6-Pack', count: 6, discountMultiplier: 0.8 },
      ],
      detailedBenefits: [],
      usageInstructions: [],
      deliveryInfo: 'Free shipping on all orders over $50. Orders are processed within 1-2 business days.',
      sustainabilityInfo: 'Our packaging is made with 80% less material than traditional bottles and is fully recyclable.',
      featuredIngredients: [],
      fullIngredientsList: [],
      advantageSection: {
        items: []
      },
      seoTitle: '',
      seoDescription: ''
    }
  });

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({ control: form.control, name: "gallery" });
  const { fields: packFields, append: appendPack, remove: removePack } = useFieldArray({ control: form.control, name: "availablePacks" });
  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({ control: form.control, name: "detailedBenefits" });
  const { fields: usageFields, append: appendUsage, remove: removeUsage } = useFieldArray({ control: form.control, name: "usageInstructions" });
  const { fields: featuredIngFields, append: appendFeaturedIng, remove: removeFeaturedIng } = useFieldArray({ control: form.control, name: "featuredIngredients" });
  const { fields: fullIngFields, append: appendFullIng, remove: removeFullIng } = useFieldArray({ control: form.control, name: "fullIngredientsList" });
  const { fields: advantageFields, append: appendAdvantage, remove: removeAdvantage } = useFieldArray({ control: form.control, name: "advantageSection.items" });

  const includedItems = form.watch('includedItems');

  const selectableProducts = useMemo(() => {
    return allProducts.filter(p => p.id !== initialData?.id && p.category !== 'Bundles');
  }, [allProducts, initialData?.id]);

  const filteredSearchProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return selectableProducts;
    return selectableProducts.filter(p => 
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(productSearchQuery.toLowerCase())
    );
  }, [selectableProducts, productSearchQuery]);

  const selectedProducts = useMemo(() => {
    return allProducts.filter(p => includedItems.includes(p.id));
  }, [allProducts, includedItems]);

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // Transitioned to /auto/upload for universal media support
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
        toast({ title: "Asset Synchronized", description: "Clinical asset has been uploaded to Cloudinary." });
      } catch (error: any) {
        console.error("Formula Asset Error:", error);
        toast({ 
          variant: "destructive", 
          title: "Storage Error", 
          description: error.message || "Could not upload clinical asset to Cloudinary. Check your configuration." 
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAiGenerateDescription = async () => {
    const name = form.getValues('name');
    const ingredients = form.getValues('ingredients');
    const benefits = form.getValues('benefits');

    if (!name || !ingredients || !benefits) {
      toast({ 
        variant: "destructive", 
        title: "Incomplete Data", 
        description: "Please provide a name, ingredients, and benefits to generate clinical copy." 
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProductDescription({
        productName: name,
        ingredients,
        benefits,
        targetAudience: 'Health-conscious high-performers seeking biological optimization.'
      });
      form.setValue('description', result.description);
      toast({ title: "Copy Generated", description: "A.I. has research-backed the clinical description." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "A.I. Error", description: "Could not reach the clinical research models." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoGenerateSku = () => {
    const name = form.getValues('name');
    const category = form.getValues('category');

    if (!name || !category) {
      toast({ 
        variant: "destructive", 
        title: "Data Missing", 
        description: "Name and Category are required to generate a logistical SKU node." 
      });
      return;
    }

    const storeName = settings?.storeName || 'Pharmlogics';
    const prefix = storeName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 3) || "PL";
    
    const nameCode = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    const catCode = category.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    
    let generatedSku = '';
    let isUnique = false;
    let attempts = 0;

    // Registry Uniqueness Protocol: Check for collisions in current catalog
    while (!isUnique && attempts < 15) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
      generatedSku = `${prefix}-${nameCode}${catCode}-${randomSuffix}`;
      
      const collision = allProducts.some(p => p.sku === generatedSku);
      if (!collision) {
        isUnique = true;
      }
      attempts++;
    }

    form.setValue('sku', generatedSku);
    
    toast({ 
      title: "Unique SKU Generated", 
      description: `Logistical identifier ${generatedSku} has been assigned and verified against the clinical registry.` 
    });
  };

  const handleFinalSubmit = (data: ProductFormValues) => {
    const formatted = {
      ...data,
      usageInstructions: data.usageInstructions.map(u => u.value),
      benefits: typeof data.benefits === 'string' ? data.benefits.split(',').map(s => s.trim()).filter(Boolean) : data.benefits,
      ingredients: typeof data.ingredients === 'string' ? data.ingredients.split(',').map(s => s.trim()).filter(Boolean) : data.ingredients,
    };
    onSubmit(formatted);
  };

  const toggleIncludedItem = (productId: string) => {
    const current = [...includedItems];
    const index = current.indexOf(productId);
    if (index === -1) {
      form.setValue('includedItems', [...current, productId]);
    } else {
      form.setValue('includedItems', current.filter(id => id !== productId));
    }
  };

  const TABS = [
    { value: 'core', label: 'Core Identity', icon: Box },
    { value: 'clinical', label: 'Clinical Details', icon: Stethoscope },
    { value: 'ingredients', label: 'Ingredients', icon: Activity },
    { value: 'advantage', label: 'Bento Advantage', icon: Layers },
    { value: 'seo', label: 'SEO Optimization', icon: Globe },
  ];

  return (
    <div className="space-y-8 pb-20 w-full max-w-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="accent" size="icon" asChild className="rounded-none h-10 w-10 border-none shrink-0">
            <Link href="/admin/catalog"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-3xl font-headline font-normal truncate">{title}</h1>
            <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest mt-1">Clinical Protocol Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={form.handleSubmit(handleFinalSubmit)} disabled={isLoading || isUploading} className="h-12 px-10 shadow-xl shadow-primary/20 uppercase text-[11px] font-bold tracking-[0.2em] shrink-0 bg-primary text-white hover:bg-primary/90 border-none">
            {(isLoading || isUploading) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isUploading ? 'Uploading Assets...' : 'Commit Protocol'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <Tabs defaultValue="core" className="w-full">
          <TabsList className="h-auto p-0 bg-transparent flex flex-wrap justify-start gap-2 mb-12">
            {TABS.map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="rounded-md px-6 py-3 border border-border/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                <tab.icon className="h-3 w-3 mr-2" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="core" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-8">
                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Core Specifications</CardTitle></CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Formula Name</FormLabel><FormControl><Input className="h-12 bg-muted/20 border-none" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <div className="relative">
                        <FormField control={form.control} name="sku" render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Logistics SKU</FormLabel>
                              <button 
                                type="button" 
                                onClick={handleAutoGenerateSku}
                                className="text-[8px] font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors uppercase tracking-widest"
                              >
                                <Zap className="h-2 w-2" /> Auto
                              </button>
                            </div>
                            <FormControl><Input placeholder="e.g. PL-OMG3-120" className="h-12 bg-muted/20 border-none font-mono text-xs pr-10" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="flavor" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Flavor / Variant</FormLabel><FormControl><Input placeholder="e.g. Raspberry Ginger" className="h-12 bg-muted/20 border-none" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Clinical Classification</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 bg-muted/20 border-none"><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {categories?.map(cat => <SelectItem key={cat.id} value={cat.name} className="text-xs uppercase">{cat.name}</SelectItem>)}
                              <SelectItem value="Bundles" className="text-xs uppercase">Bundles</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="ingredients" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Key Ingredients (comma separated)</FormLabel><FormControl><Input placeholder="e.g. Omega-3, EPA, DHA" className="h-12 bg-muted/20 border-none" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="benefits" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Primary Benefits (comma separated)</FormLabel><FormControl><Input placeholder="e.g. Heart Health, Brain Focus" className="h-12 bg-muted/20 border-none" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Short Description (Catalog)</FormLabel>
                        <Button 
                          type="button" 
                          variant="accent" 
                          size="sm" 
                          onClick={handleAiGenerateDescription} 
                          disabled={isGenerating}
                          className="h-7 text-[9px] font-bold uppercase tracking-widest rounded-full px-4 shadow-sm shadow-accent/10"
                        >
                          {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
                          {isGenerating ? 'Researching...' : 'A.I. Generate Description'}
                        </Button>
                      </div>
                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormControl><Textarea className="min-h-[120px] resize-none bg-muted/20 border-none leading-relaxed" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    {form.watch('category') === 'Bundles' && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                          <Package className="h-3 w-3" /> Bundle Composition Registry
                        </FormLabel>
                        
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                          <PopoverTrigger asChild>
                            <div className="flex flex-wrap items-center gap-2 p-3 min-h-14 w-full rounded-xl bg-muted/20 cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all">
                              {selectedProducts.length > 0 ? (
                                selectedProducts.map((p) => (
                                  <Badge key={p.id} variant="accent" className="flex items-center gap-1.5 py-1.5 pl-2.5 pr-1.5 shadow-sm">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{p.name}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleIncludedItem(p.id);
                                      }}
                                      className="rounded-full hover:bg-black/10 p-0.5"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground font-light px-2">Select formulas to include in this bundle...</span>
                              )}
                              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                            <div className="flex flex-col">
                              <div className="flex items-center border-b px-3">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <input
                                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                                  placeholder="Search formulas..."
                                  value={productSearchQuery}
                                  onChange={(e) => setProductSearchQuery(e.target.value)}
                                />
                              </div>
                              <ScrollArea className="h-72">
                                <div className="p-1">
                                  {filteredSearchProducts.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground font-light italic">No matching formulas found.</p>
                                  ) : (
                                    filteredSearchProducts.map((p) => {
                                      const isSelected = includedItems.includes(p.id);
                                      return (
                                        <button
                                          key={p.id}
                                          type="button"
                                          onClick={() => toggleIncludedItem(p.id)}
                                          className={cn(
                                            "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-3 text-sm outline-none hover:bg-muted transition-colors text-left",
                                            isSelected && "bg-accent/10 text-accent"
                                          )}
                                        >
                                          <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                                              <img src={p.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-bold text-xs truncate">{p.name}</p>
                                              <p className={cn("text-[9px] uppercase tracking-widest text-muted-foreground", isSelected && "text-accent/70")}>{p.category}</p>
                                            </div>
                                          </div>
                                          {isSelected && <Check className="ml-2 h-4 w-4 text-accent shrink-0" />}
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                      <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Primary Visual Protocol</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <label className="cursor-pointer flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
                                <Upload className="h-6 w-6 text-primary mb-2" />
                                <span className="text-[9px] font-bold uppercase text-primary">Upload Primary Asset</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e, field.onChange)} />
                              </label>
                              {field.value && (
                                <div className="relative h-48 w-full rounded-xl overflow-hidden border bg-muted/10">
                                  <img src={field.value} className="h-full w-full object-contain p-2" alt="Product preview" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="imageHint" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Asset Search Hint</FormLabel><FormControl><Input className="h-12 bg-muted/20 border-none" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Visual Asset Carousel</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendGallery({ imageUrl: '', imageHint: '' })} className="h-8 text-[9px] font-bold"><Plus className="h-3 w-3 mr-1" /> ADD IMAGE</Button>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {galleryFields.map((field, index) => (
                      <div key={field.id} className="flex gap-6 items-start border-b border-dashed pb-6 last:border-0">
                        <div className="h-24 w-24 rounded-lg overflow-hidden border bg-muted/10 flex-shrink-0">
                          {form.watch(`gallery.${index}.imageUrl`) ? (
                            <img src={form.watch(`gallery.${index}.imageUrl`)} className="h-full w-full object-cover" alt="Gallery preview" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center"><Layers className="h-6 w-6 text-muted-foreground/20" /></div>
                          )}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                          <FormField control={form.control} name={`gallery.${index}.imageUrl`} render={({ field: subField }) => (
                            <FormItem>
                              <FormLabel className="text-[9px] font-bold">Asset Selection</FormLabel>
                              <FormControl>
                                <label className="cursor-pointer flex items-center justify-center h-10 border border-dashed rounded bg-muted/5 hover:bg-muted/10 transition-colors">
                                  <Upload className="h-3 w-3 mr-2 text-primary" />
                                  <span className="text-[8px] font-bold uppercase">Replace System File</span>
                                  <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, subField.onChange)} />
                                </label>
                              </FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`gallery.${index}.imageHint`} render={({ field }) => (
                            <FormItem><FormLabel className="text-[9px] font-bold">A.I. Search Hint</FormLabel><FormControl><Input className="h-10 bg-muted/10 border-none text-xs" {...field} /></FormControl></FormItem>
                          )} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeGallery(index)} className="text-destructive h-10 w-10 mt-6"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <Card className="border-none shadow-sm bg-primary/5 rounded-xl overflow-hidden">
                  <CardHeader className="bg-primary/10 pb-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Activity className="h-3 w-3" /> Financials & Inventory
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Base Price</FormLabel><FormControl><Input type="number" step="0.01" className="h-12 bg-card border-none font-headline" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="stock" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Current Stock</FormLabel><FormControl><Input type="number" className="h-12 bg-card border-none font-headline" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="subscriptionDiscount" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Subscription Discount %</FormLabel>
                        <FormControl><Input type="number" className="h-12 bg-card border-none font-headline" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Pricing Tiers</CardTitle><Button type="button" variant="ghost" size="icon" onClick={() => appendPack({ label: '', count: 1, discountMultiplier: 1 })} className="h-8 w-8"><Plus className="h-4 w-4" /></Button></CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {packFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-2 items-end border-b border-dashed border-border/30 pb-4 last:border-0">
                        <div className="col-span-5"><FormField control={form.control} name={`availablePacks.${index}.label`} render={({ field }) => (<FormItem><FormControl><Input className="h-8 text-[10px] border-none bg-muted/10 px-2" placeholder="Label" {...field} /></FormControl></FormItem>)} /></div>
                        <div className="col-span-3"><FormField control={form.control} name={`availablePacks.${index}.count`} render={({ field }) => (<FormItem><FormControl><Input type="number" className="h-8 text-[10px] border-none bg-muted/10 px-2" placeholder="Qty" {...field} /></FormControl></FormItem>)} /></div>
                        <div className="col-span-3"><FormField control={form.control} name={`availablePacks.${index}.discountMultiplier`} render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.01" className="h-8 text-[10px] border-none bg-muted/10 px-2" placeholder="Mult" {...field} /></FormControl></FormItem>)} /></div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removePack(index)} className="col-span-1 h-8 w-8 text-destructive/50 hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clinical" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Detailed Benefits Accordion</CardTitle><Button type="button" variant="outline" size="sm" onClick={() => appendBenefit({ title: '', description: '' })} className="h-8 text-[9px] font-bold"><Plus className="h-3 w-3 mr-1" /> ADD BENEFIT</Button></CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {benefitFields.map((field, index) => (
                    <div key={field.id} className="space-y-3 p-4 bg-muted/10 rounded-lg relative group border border-transparent hover:border-primary/10 transition-all">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(index)} className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></Button>
                      <FormField control={form.control} name={`detailedBenefits.${index}.title`} render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-bold uppercase">Benefit Title</FormLabel><FormControl><Input className="h-10 bg-background border-none text-xs" {...field} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name={`detailedBenefits.${index}.description`} render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-bold uppercase">Full Description</FormLabel><FormControl><Textarea className="min-h-[80px] bg-background border-none text-xs resize-none" {...field} /></FormControl></FormItem>)} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Usage Protocol (List)</CardTitle><Button type="button" variant="outline" size="sm" onClick={() => appendUsage({ value: '' })} className="h-8 text-[9px] font-bold"><Plus className="h-3 w-3 mr-1" /> ADD STEP</Button></CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    {usageFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-center">
                        <FormField control={form.control} name={`usageInstructions.${index}.value`} render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input className="h-10 bg-muted/10 border-none text-xs" placeholder="e.g. Take with food" {...field} />
                            </FormControl>
                          </FormItem>
                        )} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeUsage(index)} className="text-destructive h-10 w-10"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Logistical Node Data</CardTitle></CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <FormField control={form.control} name="deliveryInfo" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Delivery Accordion Text</FormLabel><FormControl><Textarea className="h-24 bg-muted/20 border-none text-sm resize-none" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="sustainabilityInfo" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest">Sustainability Accordion Text</FormLabel><FormControl><Textarea className="h-24 bg-muted/20 border-none text-sm resize-none" {...field} /></FormControl></FormItem>
                    )} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Card className="border-none shadow-sm rounded-xl overflow-hidden h-full">
                  <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Featured Ingredient Protocol</CardTitle><Button type="button" variant="outline" size="sm" onClick={() => appendFeaturedIng({ name: '', description: '', imageUrl: '', imageHint: 'ingredient' })} className="h-8 text-[9px] font-bold"><Plus className="h-3 w-3 mr-1" /> ADD INGREDIENT</Button></CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {featuredIngFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-4 p-4 bg-muted/10 rounded-lg relative group border border-transparent hover:border-primary/10 transition-all">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFeaturedIng(index)} className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 z-10"><Trash2 className="h-3 w-3" /></Button>
                        <div className="col-span-4 space-y-2">
                          <FormField control={form.control} name={`featuredIngredients.${index}.imageUrl`} render={({ field: subField }) => (
                            <FormItem>
                              <FormControl>
                                <label className="cursor-pointer flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed rounded bg-background/50 hover:bg-background transition-colors overflow-hidden">
                                  {subField.value ? (
                                    <img src={subField.value} className="w-full h-full object-cover" alt="Ingredient preview" />
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 text-primary mb-1" />
                                      <span className="text-[8px] font-bold uppercase">Asset</span>
                                    </>
                                  )}
                                  <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, subField.onChange)} />
                                </label>
                              </FormControl>
                            </FormItem>
                          )} />
                        </div>
                        <div className="col-span-8 space-y-3">
                          <FormField control={form.control} name={`featuredIngredients.${index}.name`} render={({ field }) => (<FormItem><FormControl><Input className="h-9 bg-background border-none text-xs font-bold" placeholder="Ingredient Name" {...field} /></FormControl></FormItem>)} />
                          <FormField control={form.control} name={`featuredIngredients.${index}.description`} render={({ field }) => (<FormItem><FormControl><Textarea className="h-20 bg-background border-none text-xs resize-none" placeholder="Scientific description..." {...field} /></FormControl></FormItem>)} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-5">
                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Full Clinical Registry</CardTitle><Button type="button" variant="ghost" size="icon" onClick={() => removeFullIng(fullIngFields.length - 1)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    {fullIngFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormField control={form.control} name={`fullIngredientsList.${index}.name`} render={({ field }) => (<FormItem className="flex-[2]"><FormControl><Input className="h-9 bg-muted/10 border-none text-xs" placeholder="e.g. Vitamin C" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name={`fullIngredientsList.${index}.amount`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input className="h-9 bg-muted/10 border-none text-xs" placeholder="e.g. 500mg" {...field} /></FormControl></FormItem>)} />
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full mt-2 h-9 text-[9px] font-bold uppercase" onClick={() => appendFullIng({ name: '', amount: '' })}><Plus className="h-3 w-3 mr-2" /> ADD LINE ITEM</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advantage" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-card">
              <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">The Pharmlogics Advantage Bento Grid</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => appendAdvantage({ title: '', description: '', imageUrl: '', imageHint: 'advantage node' })} className="h-8 text-[9px] font-bold"><Plus className="h-3 w-3 mr-1" /> ADD BENTO NODE</Button>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {advantageFields.map((field, index) => (
                    <div key={field.id} className="space-y-4 p-6 bg-muted/5 rounded-2xl border border-dashed border-primary/20 relative group hover:bg-muted/10 transition-colors">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAdvantage(index)} className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></Button>
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Node 0{index + 1}</h4>
                        <span className="text-[8px] font-bold uppercase opacity-40">Bento Component</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-4">
                          <FormField control={form.control} name={`advantageSection.items.${index}.imageUrl`} render={({ field: subField }) => (
                            <FormItem>
                              <FormLabel className="text-[9px] font-bold">Node Asset</FormLabel>
                              <FormControl>
                                <label className="cursor-pointer flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg bg-background/50 hover:bg-background transition-all overflow-hidden relative group/asset">
                                  {subField.value ? (
                                    <img src={subField.value} className="w-full h-full object-cover" alt="Advantage preview" />
                                  ) : (
                                    <Upload className="h-5 w-5 text-primary/40" />
                                  )}
                                  <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, subField.onChange)} />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px] font-bold uppercase">Replace</div>
                                </label>
                              </FormControl>
                            </FormItem>
                          )} />
                        </div>
                        <div className="md:col-span-8 space-y-4">
                          <FormField control={form.control} name={`advantageSection.items.${index}.title`} render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-bold">Title</FormLabel><FormControl><Input className="h-10 bg-background border-none text-xs font-bold" {...field} /></FormControl></FormItem>)} />
                          <FormField control={form.control} name={`advantageSection.items.${index}.description`} render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-bold">Description</FormLabel><FormControl><Textarea className="h-20 bg-background border-none text-xs resize-none" {...field} /></FormControl></FormItem>)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Globe className="h-3 w-3" /> Formula Meta Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <FormField control={form.control} name="seoTitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Override Meta Title</FormLabel>
                        <FormControl><Input className="h-12 bg-muted/20 border-none" placeholder="e.g. Premium Activated Omega-3 Protocol" {...field} /></FormControl>
                        <FormDescription className="text-[10px]">Leave blank to use the formula name automatically.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="seoDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Override Meta Description</FormLabel>
                        <FormControl><Textarea className="min-h-[120px] resize-none bg-muted/20 border-none leading-relaxed" placeholder="Detailed scientific summary for search results..." {...field} /></FormControl>
                        <FormDescription className="text-[10px]">Leave blank to use the clinical description automatically.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-5">
                <Card className="bg-primary text-white border-none rounded-xl overflow-hidden shadow-xl h-full">
                  <CardContent className="p-8 space-y-6 relative z-10">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Globe className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-headline leading-tight">Global <br /> Discoverability.</h3>
                    <p className="text-white/70 font-light leading-relaxed text-sm">
                      Individual product SEO allows targeted search intent to land directly on this node. High-integrity metadata increases your formula's biological reach.
                    </p>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-2">Search Preview</p>
                      <div className="p-4 bg-white rounded text-black space-y-1">
                        <p className="text-blue-600 text-sm font-medium truncate">{form.watch('seoTitle') || form.watch('name') || 'Formula Title'}</p>
                        <p className="text-green-700 text-[10px] truncate">pharmlogics.com/products/{initialData?.id || '...'}</p>
                        <p className="text-gray-600 text-[10px] line-clamp-2">{form.watch('seoDescription') || form.watch('description') || 'Scientific summary...'}</p>
                      </div>
                    </div>
                  </CardContent>
                  <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Form>
    </div>
  );
}
