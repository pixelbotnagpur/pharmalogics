
"use client";

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/common/NotificationBell';

// Heavily logic-dependent components loaded dynamically to optimize initial TTI
const CartSheet = dynamic(() => import('@/components/cart/CartSheet').then(mod => mod.CartSheet), { ssr: false });
const AccountSheet = dynamic(() => import('@/components/header/AccountSheet').then(mod => mod.AccountSheet), { ssr: false });

interface HeaderActionsProps {
  isLoggedIn: boolean;
  user: { name: string; email: string; initials: string };
  scrolled: boolean;
  isSearchMenuOpen: boolean;
  onSearchClick: () => void;
  isTransparentPage: boolean;
  isAnyMenuOpen: boolean;
  isAccountOpen: boolean;
  setIsAccountOpen: (open: boolean) => void;
  onLogout: () => void;
  useDarkText: boolean;
}

export function HeaderActions({
  isLoggedIn,
  user,
  isAccountOpen,
  setIsAccountOpen,
  onSearchClick,
  onLogout,
  useDarkText,
  isAnyMenuOpen
}: HeaderActionsProps) {
  const { itemCount, isCartOpen, setIsCartOpen } = useCart();
  const router = useRouter();
  
  const textClass = useDarkText 
    ? 'text-primary hover:text-primary hover:bg-primary/5' 
    : 'text-white hover:text-white hover:bg-white/10';

  const handleAccountClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setIsAccountOpen(!isAccountOpen);
    }
  };

  return (
    <div className={cn(
        "relative hidden h-11 items-center gap-1 rounded-md px-1 transition-all duration-500 md:flex",
        isAnyMenuOpen && "z-[60]"
    )}>
      <Button
        variant="ghost"
        size="sm"
        className={cn("rounded-md px-3 text-sm gap-1 font-bold uppercase tracking-widest h-auto py-2 transition-colors", textClass)}
        onClick={onSearchClick}
      >
        <Search className="h-4 w-4" />
        SEARCH
      </Button>

      <div className="flex items-center gap-1.5 px-3 border-l border-border/20 h-5">
        <span className={cn(
          "text-sm font-bold uppercase tracking-widest transition-colors duration-300",
          useDarkText ? "text-primary" : "text-white"
        )}>EN</span>
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-slow-pulse" />
      </div>

      {isLoggedIn && (
        <NotificationBell 
          variant={useDarkText ? 'dark' : 'light'}
          className="mx-1"
        />
      )}

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleAccountClick}
        className={cn(
          "rounded-md px-3 text-sm font-bold uppercase tracking-widest h-auto py-2 transition-all duration-300", 
          isAccountOpen ? "bg-primary text-white scale-105" : textClass
        )}
      >
        {isLoggedIn ? 'ACCOUNT' : 'LOG IN'}
      </Button>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsCartOpen(!isCartOpen)}
        className={cn(
          "rounded-md px-4 text-sm font-bold uppercase tracking-widest h-auto py-2 transition-all duration-300", 
          isCartOpen ? "bg-primary text-white scale-105" : textClass
        )}
      >
        BAG [<span>{itemCount}</span>]
      </Button>

      <CartSheet />
      <AccountSheet 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
        user={user}
        onLogout={onLogout}
      />
    </div>
  );
}
