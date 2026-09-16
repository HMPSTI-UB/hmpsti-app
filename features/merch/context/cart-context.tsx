"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { PublicProduct, PublicProductSize } from "../types";

export type CartItem = {
  id: string;
  product: PublicProduct;
  quantity: number;
  selectedSize?: PublicProductSize;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: PublicProduct, quantity: number, selectedSize?: PublicProductSize) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hmpsti-merch-cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("hmpsti-merch-cart", JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save cart to localStorage", error);
      }
    }
  }, [items, isLoaded]);

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const addToCart = (
    product: PublicProduct,
    quantity: number,
    selectedSize?: PublicProductSize
  ) => {
    setItems((prevItems) => {
      const id = `${product.id}-${selectedSize ? selectedSize.id : "nosize"}`;
      const existingItem = prevItems.find((item) => item.id === id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { id, product, quantity, selectedSize }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
