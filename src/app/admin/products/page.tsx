
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { generateProductDescription, GenerateProductDescriptionOutput } from '@/ai/flows/ai-product-description-generator';
import { Sparkles, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  ingredients: z.string().min(1, 'Ingredients are required').describe('Comma-separated list'),
  benefits: z.string().min(1, 'Benefits are required').describe('Comma-separated list'),
  targetAudience: z.string().min(1, 'Target audience is required'),
});

type FormValues = z.infer<typeof formSchema>;

function ProductAIContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [generation, setGeneration] = useState<GenerateProductDescriptionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: searchParams.get('name') || '',
      ingredients: searchParams.get('ingredients') || '',
      benefits: searchParams.get('benefits') || '',
      targetAudience: 'Health-conscious individuals seeking clinical optimization.',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setGeneration(null);
    try {
      const result = await generateProductDescription(data);
      setGeneration(result);
    } catch (e) {
      setError('An error occurred while generating the description.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generation?.description) {
      navigator.clipboard.writeText(generation.description);
      setIsCopied(true);
      toast({ title: "Copied to Clipboard", description: "The clinical copy is ready for the registry." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="border-none shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-headline text-xl">A.I. Copy Generator</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground mt-1">Clinical Marketing Protocol</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Formula Name</FormLabel>
                    <FormControl><Input className="h-12 bg-muted/20 border-none" placeholder="e.g. Magnesium Glycinate+" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Key Bioactives (comma-separated)</FormLabel>
                    <FormControl><Input className="h-12 bg-muted/20 border-none" placeholder="e.g. Chelated Magnesium, L-Theanine" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Clinical Outcomes (comma-separated)</FormLabel>
                    <FormControl><Input className="h-12 bg-muted/20 border-none" placeholder="e.g. Deep REM Sleep, Muscle Recovery" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Target Biological Profile</FormLabel>
                    <FormControl><Input className="h-12 bg-muted/20 border-none" placeholder="e.g. High-performers, Athletes" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full h-14 text-xs font-bold tracking-[0.2em] uppercase rounded-lg shadow-xl shadow-primary/10 transition-all hover:scale-[1.01]">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                {isLoading ? 'RESEARCHING...' : 'GENERATE CLINICAL COPY'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-card">
        <CardHeader className="bg-primary pb-6 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline text-lg">Generated Node Data</CardTitle>
            {generation && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                className="h-8 bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary text-[10px] font-bold uppercase"
              >
                {isCopied ? <Check className="h-3 w-3 mr-1.5" /> : <Copy className="h-3 w-3 mr-1.5" />}
                {isCopied ? 'COPIED' : 'COPY TO REGISTRY'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-8">
            {isLoading && (
                 <div className="space-y-6">
                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                 </div>
            )}
            {error && (
              <div className="p-6 bg-destructive/5 rounded-xl border border-destructive/10 text-center">
                <p className="text-destructive text-sm font-light">{error}</p>
              </div>
            )}
            {generation ? (
                <div className="space-y-4 animate-in fade-in duration-700">
                  <p className="text-sm font-light text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4 py-2">
                    "This clinical description is ready for deployment to the public storefront."
                  </p>
                  <Textarea 
                      value={generation.description}
                      readOnly
                      className="min-h-[350px] bg-muted/10 border-none text-base font-light leading-relaxed resize-none p-6 rounded-xl"
                  />
                </div>
            ) : !isLoading && (
              <div className="flex flex-col items-center justify-center py-32 text-center opacity-30">
                <Sparkles className="h-16 w-16 mb-4 text-muted-foreground" strokeWidth={1} />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Awaiting Analysis</p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProductAIPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    }>
      <ProductAIContent />
    </Suspense>
  );
}
