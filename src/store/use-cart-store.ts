import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  courseId: string;
  title: string;
  price: number;
  thumbnail?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (courseId: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const exists = get().items.some((i) => i.courseId === item.courseId);
        if (!exists) {
          set((state) => ({ items: [...state.items, item] }));
        }
      },
      removeItem: (courseId) =>
        set((state) => ({
          items: state.items.filter((i) => i.courseId !== courseId),
        })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
    }),
    { name: 'cart-storage' }
  )
);
