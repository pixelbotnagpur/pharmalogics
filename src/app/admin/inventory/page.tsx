'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { predictiveLowStockAlert, PredictiveLowStockAlertOutput } from '@/ai/flows/predictive-low-stock-alert';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info, Truck } from 'lucide-react';

const formSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  currentStock: z.coerce.number().min(0, 'Stock must be non-negative'),
  salesHistory: z.string().min(1, 'Sales history is required').regex(/^(\d+,\s*)*\d+$/, 'Must be comma-separated numbers'),
  reorderLeadTimeDays: z.coerce.number().min(0, 'Lead time must be non-negative'),
  desiredSafetyStockDays: z.coerce.number().min(0, 'Safety stock days must be non-negative'),
});

type FormValues = z.infer<typeof formSchema>;

export default function InventoryPage() {
  const [prediction, setPrediction] = useState<PredictiveLowStockAlertOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: 'Omega-3 Fish Oil',
      currentStock: 120,
      salesHistory: '10, 12, 8, 15, 11, 9, 13',
      reorderLeadTimeDays: 7,
      desiredSafetyStockDays: 14,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const salesHistoryArray = data.salesHistory.split(',').map(s => parseInt(s.trim(), 10));
      const result = await predictiveLowStockAlert({
        ...data,
        salesHistory: salesHistoryArray,
      });
      setPrediction(result);
    } catch (e) {
      setError('An error occurred while running the prediction.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="font-headline text-xl sm:text-2xl">Predictive Low Stock Alert</CardTitle>
          <CardDescription className="text-xs">Enter product inventory data to predict if stock is running low.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Vitamin D3" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Stock</FormLabel>
                      <FormControl><Input type="number" className="h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="reorderLeadTimeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lead Time (days)</FormLabel>
                      <FormControl><Input type="number" className="h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="salesHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recent Daily Sales</FormLabel>
                    <FormControl><Input placeholder="e.g., 10, 12, 8" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="desiredSafetyStockDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Safety Stock (days)</FormLabel>
                      <FormControl><Input type="number" className="h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <Button type="submit" disabled={isLoading} className="w-full h-12 text-[11px] font-bold tracking-widest uppercase mt-4">
                {isLoading ? 'Analyzing...' : 'Analyze Stock'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {isLoading && (
            <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                     <div className="flex items-center space-x-4">
                        <div className="space-y-2 w-full">
                           <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                           <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
                           <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                           <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
        {error && (
            <Alert variant="destructive" className="border-none shadow-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-xs font-bold uppercase tracking-widest">Error</AlertTitle>
                <AlertDescription className="text-sm font-light">{error}</AlertDescription>
            </Alert>
        )}
        {prediction && (
            <Alert variant={prediction.isLowStock ? 'destructive' : 'default'} className="border-none shadow-sm">
              {prediction.isLowStock ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              <AlertTitle className="text-xs font-bold uppercase tracking-widest">{prediction.isLowStock ? 'Low Stock Alert!' : 'Stock Status: OK'}</AlertTitle>
              <AlertDescription className="space-y-3 mt-3">
                <p className="text-sm font-light leading-relaxed">{prediction.alertMessage}</p>
                {prediction.isLowStock && prediction.recommendedReorderQuantity && (
                    <div className="p-3 bg-white/10 rounded-lg">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Recommended Action</p>
                      <p className="text-sm font-medium mt-1">Order {prediction.recommendedReorderQuantity} units immediately.</p>
                    </div>
                )}
              </AlertDescription>
            </Alert>
        )}
        {!prediction && !isLoading && (
          <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-12 text-muted-foreground opacity-40">
            <Truck className="h-16 w-16 mb-4" strokeWidth={1} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Awaiting Data Input</p>
          </div>
        )}
      </div>
    </div>
  );
}
