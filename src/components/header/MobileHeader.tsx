'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Menu, Plus, Search, X } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileHeaderProps {
  isLoggedIn: boolean;
  scrolled: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onSearchClick: () => void;
  handleAddToCart: (product: Product) => void;
  products: Product[];
  mobileNavItems: { href: string; label: string }[];
  isTransparentPage: boolean;
  isAnyMenuOpen: boolean;
  useDarkText: boolean;
}

export function MobileHeader({
  isLoggedIn,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onSearchClick,
  handleAddToCart,
  products,
  mobileNavItems,
  isAnyMenuOpen,
  useDarkText
}: MobileHeaderProps) {
  const { itemCount, isCartOpen, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const textClass = useDarkText 
    ? 'text-primary hover:text-primary hover:bg-primary/5' 
    : 'text-white hover:text-white hover:bg-white/10';

  return (
    <div className="flex items-center md:hidden">
       <div className={cn(
          "relative flex h-10 items-center gap-1 rounded-md px-1 transition-all duration-500",
          isAnyMenuOpen && "z-[60]"
      )}>
          <Button
          variant="ghost"
          size="icon"
          className={cn("transition-colors duration-300", textClass)}
          onClick={onSearchClick}
          >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
          </Button>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
              <Button
              variant="ghost"
              size="icon"
              className={cn("transition-colors duration-300", textClass)}
              >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
              </Button>
          </SheetTrigger>
          <SheetContent
              side="left"
              className="bg-background text-foreground p-0 w-full max-w-full sm:max-w-full"
          >
              <SheetHeader className="p-4 border-b border-border h-14 flex flex-row items-center justify-between">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <Link href="/" className="flex items-center gap-2">
                  <span className="font-headline text-2xl font-normal text-foreground">
                      Pharmlogics
                  </span>
                  </Link>
                  <div className="flex items-center gap-0">
                  <SheetClose asChild>
                      <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                      <X className="h-5 w-5" />
                      </Button>
                  </SheetClose>
                  </div>
              </SheetHeader>
              <div className="flex flex-col h-[calc(100%-3.5rem)]">
                  <ScrollArea className="flex-1">
                      <div className="p-4">
                      <p className="text-sm uppercase tracking-widest text-muted-foreground">
                          Explore Our Solutions
                      </p>
                      <div className="mt-4 space-y-2">
                          {products.slice(0, 4).map((product) => (
                          <Card
                              key={product.id}
                              className="overflow-hidden h-full bg-card rounded-lg border-0 shadow-sm text-foreground cursor-pointer"
                              onClick={() => router.push(`/products/${product.id}`)}
                          >
                              <CardContent className="p-3 flex items-center gap-4 h-full">
                              <div className="relative w-16 h-16 flex-shrink-0">
                                  <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-contain"
                                  data-ai-hint={product.imageHint}
                                  sizes="64px"
                                  />
                              </div>
                              <div className="flex-1">
                                  <h4 className="font-headline text-lg font-normal leading-tight">
                                  {product.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                  {product.benefits.slice(0, 3).join(', ')}
                                  </p>
                              </div>
                              <Button
                                  size="icon"
                                  className="h-8 w-8 ml-auto flex-shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground"
                                  onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                  }}
                              >
                                  <Plus className="h-4 w-4" />
                              </Button>
                              </CardContent>
                          </Card>
                          ))}
                      </div>
                      </div>
                  </ScrollArea>

                  <div className="p-4 mt-auto space-y-2 bg-card border-t">
                      <div className="bg-primary rounded-md p-1 flex justify-around items-center">
                      {mobileNavItems.map((item) => (
                          <Button
                          key={item.href}
                          variant="ghost"
                          asChild
                          className="flex-1 text-primary-foreground text-sm font-bold uppercase tracking-widest hover:bg-secondary data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                          data-active={pathname === item.href}
                          >
                          <Link href={item.href}>{item.label}</Link>
                          </Button>
                      ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                      {isLoggedIn ? (
                          <Button
                          variant="accent"
                          asChild
                          className="font-bold uppercase tracking-widest"
                          >
                          <Link href="/dashboard">Account</Link>
                          </Button>
                      ) : (
                          <Button
                          variant="accent"
                          asChild
                          className="font-bold uppercase tracking-widest"
                          >
                          <Link href="/login">Account</Link>
                          </Button>
                      )}
                      <Button variant="accent" className="font-bold uppercase tracking-widest">
                          EN
                      </Button>
                      </div>
                  </div>
              </div>
          </SheetContent>
          </Sheet>
          
          <Button
            variant={isCartOpen ? "primary" : "ghost"} 
            size="sm" 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className={cn(
              "relative h-10 px-2 text-sm font-bold normal-case transition-all duration-300",
              isCartOpen ? "bg-primary text-white" : textClass
            )}
          >
            <span>[<span>{itemCount}</span>]</span>
          </Button>
      </div>
    </div>
  );
}
