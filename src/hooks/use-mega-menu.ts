"use client";

import * as React from 'react';
import { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react';

interface MegaMenuContextType {
  isMegaMenuOpen: boolean;
  handleMegaMenuEnter: () => void;
  handleMegaMenuLeave: () => void;
  setIsMegaMenuOpen: (isOpen: boolean) => void;
}

const MegaMenuContext = createContext<MegaMenuContextType | undefined>(undefined);

export function MegaMenuProvider({ children }: { children: ReactNode }) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMegaMenuEnter = useCallback(() => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setIsMegaMenuOpen(true);
  }, []);

  const handleMegaMenuLeave = useCallback(() => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 500);
  }, []);

  const value = {
    isMegaMenuOpen,
    handleMegaMenuEnter,
    handleMegaMenuLeave,
    setIsMegaMenuOpen,
  };

  return React.createElement(MegaMenuContext.Provider, { value: value }, children);
}

export const useMegaMenu = (): MegaMenuContextType => {
  const context = useContext(MegaMenuContext);
  if (context === undefined) {
    throw new Error('useMegaMenu must be used within a MegaMenuProvider');
  }
  return context;
};
