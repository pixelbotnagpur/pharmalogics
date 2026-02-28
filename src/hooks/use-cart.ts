
"use client";

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { CartItem } from '@/lib/types';

const FREE_SHIPPING_THRESHOLD = 50;

interface CartContextType {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string, packLabel?: string, subscriptionFrequency?: number) => void;
  updateQuantity: (itemId: string, quantity: number, packLabel?: string, subscriptionFrequency?: number) => void;
  toggleSubscription: (itemId: string, packLabel?: string, currentFrequency?: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
  freeShippingProgress: number;
  isFreeShipping: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('pharmlogics_cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pharmlogics_cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = (itemToAdd: CartItem) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => 
          item.id === itemToAdd.id && 
          item.subscriptionFrequency === itemToAdd.subscriptionFrequency &&
          item.packLabel === itemToAdd.packLabel
      );
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += itemToAdd.quantity;
        return newCart;
      }
      return [...prevCart, itemToAdd];
    });
    setIsCartOpen(true);
  };

  const removeItem = (itemId: string, packLabel?: string, subscriptionFrequency?: number) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.id === itemId && item.packLabel === packLabel && item.subscriptionFrequency === subscriptionFrequency)
    ));
  };

  const updateQuantity = (itemId: string, quantity: number, packLabel?: string, subscriptionFrequency?: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        (item.id === itemId && item.packLabel === packLabel && item.subscriptionFrequency === subscriptionFrequency) 
          ? { ...item, quantity: Math.max(0, quantity) } 
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const toggleSubscription = (itemId: string, packLabel?: string, currentFrequency?: number) => {
    setCart(prevCart => {
      const targetIndex = prevCart.findIndex(i => 
        i.id === itemId && i.packLabel === packLabel && i.subscriptionFrequency === currentFrequency
      );
      
      if (targetIndex === -1) return prevCart;

      const newCart = [...prevCart];
      const item = newCart[targetIndex];
      
      // If currently one-time (undefined), switch to 30 days subscription and apply 15% discount
      if (!currentFrequency) {
        item.subscriptionFrequency = 30;
        item.price = item.price * 0.85; // 15% Subscribe & Save discount
      } else {
        // If currently subscription, switch to one-time and remove discount
        item.subscriptionFrequency = undefined;
        item.price = item.price / 0.85;
      }
      
      return newCart;
    });
  };
  
  const clearCart = () => {
    setCart([]);
  };

  const { itemCount, totalPrice } = useMemo(() => {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { itemCount, totalPrice };
  }, [cart]);

  const { freeShippingProgress, isFreeShipping } = useMemo(() => {
    const progress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
    return { freeShippingProgress: progress, isFreeShipping: totalPrice >= FREE_SHIPPING_THRESHOLD };
  }, [totalPrice]);

  const value = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    toggleSubscription,
    clearCart,
    itemCount,
    totalPrice,
    freeShippingProgress,
    isFreeShipping,
    isCartOpen,
    setIsCartOpen,
  };

  return React.createElement(CartContext.Provider, { value: value }, children);
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
