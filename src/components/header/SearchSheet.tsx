'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Plus, Loader2 } from 'lucide-react';
import type { Product, StoreSettings } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

interface SearchSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  popularProducts: Product[];
  handleAddToCart: (product: Product) => void;
}

export function SearchSheet({ isOpen, onOpenChange, popularProducts: staticPopular, handleAddToCart }: SearchSheetProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize with Store Registry for Currency
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '$';

  // Synchronize with Product Registry (Dynamic Node)
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: allProducts, isLoading } = useCollection<Product>(productsQuery);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim() || !allProducts) return [];
    return allProducts.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 6);
  }, [searchQuery, allProducts]);

  // Derived Popular Products Node: Prioritizes Dynamic Data from Registry
  const popularProducts = useMemo(() => {
    if (allProducts && allProducts.length > 0) {
      return allProducts.slice(0, 3);
    }
    return staticPopular; // Fallback to static if registry is empty/loading
  }, [allProducts, staticPopular]);

  const onClose = () => {
    onOpenChange(false);
    setSearchQuery('');
  };

  const handleItemClick = (item: Product) => {
    const route = item.category === 'Bundles' ? `/bundles/${item.id}` : `/products/${item.id}`;
    router.push(route);
    onClose();
  };

  if (isMobile === undefined) return null;
  
  const searchResultsContent = (
    <div className="container mx-auto">
      <div className="relative mb-8">
        <Input
          placeholder="What can we help you find?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 text-2xl font-headline font-normal bg-transparent border-0 border-b-2 border-border rounded-none focus-visible:ring-0 pl-0 pr-24 text-foreground placeholder:text-muted-foreground"
          autoFocus
        />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary opacity-40" />
          ) : (
            <Search className="h-6 w-6 text-muted-foreground" />
          )}
          {!isMobile && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground" onClick={onClose}>
              <X className="h-5 w-5"/>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-sm uppercase tracking-widest text-muted-foreground">
          {searchQuery ? 'Search Results' : 'Popular Protocols'}
        </h4>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {(searchQuery ? filteredItems : popularProducts).map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden h-full bg-card rounded-lg text-card-foreground cursor-pointer group border-0 shadow-none hover:bg-card/80 transition-colors"
              onClick={() => handleItemClick(item)}
            >
              <CardContent className="p-3 flex items-center gap-4 h-full">
                <div className="relative w-16 h-16 flex-shrink-0 bg-muted/10 rounded-md overflow-hidden">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1" data-ai-hint={item.imageHint} sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline text-lg font-normal leading-tight truncate">{item.name}</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">{currencySymbol}{item.price.toFixed(2)}</p>
                </div>
                <Button
                  size="icon"
                  variant="accent"
                  className="h-8 w-8 ml-auto flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(item);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {searchQuery && !isLoading && filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground italic font-light">
              No clinical records found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="bg-background text-foreground p-0 w-full">
          <SheetHeader className="p-4 border-b border-border h-16 flex flex-row items-center justify-between">
            <SheetTitle>Search Registry</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-4rem)] p-4">
            {searchResultsContent}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
          animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
          className="fixed top-16 inset-x-0 bg-background shadow-2xl rounded-b-xl z-40 border-t-0 h-auto max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-8 pt-12 pb-8">
            {searchResultsContent}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
