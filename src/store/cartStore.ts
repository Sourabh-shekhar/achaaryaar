"use client";

import { create } from "zustand";

type CartItem = {
  name: string;
  price: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "quantity">) => void;

  removeItem: (name: string) => void;

  increaseQuantity: (name: string) => void;

  decreaseQuantity: (name: string) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (cartItem) => cartItem.name === item.name
      );

      if (existing) {
        return {
          items: state.items.map((cartItem) =>
            cartItem.name === item.name
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + 1,
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
            quantity: 1,
          },
        ],
      };
    }),

  increaseQuantity: (name) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.name === name
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      ),
    })),

  decreaseQuantity: (name) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.name === name
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),

  removeItem: (name) =>
    set((state) => ({
      items: state.items.filter(
        (item) => item.name !== name
      ),
    })),
}));