"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  businessId: string;
  businessName: string;
  businessSlug: string;
}

interface CartContextType {
  items: CartItem[];
  businessId: string | null;
  businessName: string;
  businessSlug: string;
  total: number;
  count: number;
  addItem: (item: Omit<CartItem, "quantity">) => boolean; // returns false if business conflict
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  conflictPending: null | Omit<CartItem, "quantity">;
  resolveConflict: (accept: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "villamarket_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [conflictPending, setConflictPending] = useState<null | Omit<CartItem, "quantity">>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const businessId = items[0]?.businessId ?? null;
  const businessName = items[0]?.businessName ?? "";
  const businessSlug = items[0]?.businessSlug ?? "";
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const addItem = (item: Omit<CartItem, "quantity">): boolean => {
    if (businessId && businessId !== item.businessId) {
      setConflictPending(item);
      return false;
    }

    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    return true;
  };

  const removeItem = (productId: string) =>
    setItems(prev => prev.filter(i => i.productId !== productId));

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const resolveConflict = (accept: boolean) => {
    if (accept && conflictPending) {
      setItems([{ ...conflictPending, quantity: 1 }]);
    }
    setConflictPending(null);
  };

  return (
    <CartContext.Provider value={{
      items, businessId, businessName, businessSlug,
      total, count, addItem, removeItem, updateQuantity,
      clearCart, conflictPending, resolveConflict,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
