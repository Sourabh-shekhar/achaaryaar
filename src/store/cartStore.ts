"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariant: string;
};

type CartStore = {
  items: CartItem[];

  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity?: number
  ) => void;

  removeItem: (
    name: string,
    selectedVariant: string
  ) => void;

  increaseQuantity: (
    name: string,
    selectedVariant: string
  ) => void;

  decreaseQuantity: (
    name: string,
    selectedVariant: string
  ) => void;

  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) =>
              cartItem.name === item.name &&
              cartItem.selectedVariant === item.selectedVariant
          );

          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.name === item.name &&
                cartItem.selectedVariant === item.selectedVariant
                  ? {
                      ...cartItem,
                      quantity: cartItem.quantity + quantity,
                    }
                  : cartItem
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity,
              },
            ],
          };
        }),

      increaseQuantity: (name, selectedVariant) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.name === name &&
            item.selectedVariant === selectedVariant
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        })),

      decreaseQuantity: (name, selectedVariant) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.name === name &&
              item.selectedVariant === selectedVariant
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      removeItem: (name, selectedVariant) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.name === name &&
                item.selectedVariant === selectedVariant
              )
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "achaaryaar-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);