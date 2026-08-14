import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductOverview } from '@/types';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

interface WishlistState {
  productIds: number[];
  items: ProductOverview[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      items: [],
      isLoading: false,

      isInWishlist: (productId: number) => {
        return get().productIds.includes(productId);
      },

      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const isAuth = useAuthStore.getState().isAuthenticated;
          const currentIds = get().productIds;

          if (isAuth) {
            const res = await api.get<{ response?: ProductOverview[] }>('/Wishlist/get');
            const products = res.data.response || [];
            set({
              items: products,
              productIds: products.map((p) => p.id),
              isLoading: false,
            });
          } else if (currentIds.length > 0) {
            // Fetch anonymous wishlist items
            const params = new URLSearchParams();
            currentIds.forEach((id) => params.append('ProductIds', String(id)));
            const res = await api.get<{ products?: ProductOverview[] }>(`/Wishlist/get?${params.toString()}`);
            const products = res.data.products || [];
            set({ items: products, isLoading: false });
          } else {
            set({ items: [], isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      toggleWishlist: async (productId: number) => {
        const isAuth = useAuthStore.getState().isAuthenticated;
        const currentIds = [...get().productIds];
        const isCurrentlyIn = currentIds.includes(productId);

        let newIds: number[];
        if (isCurrentlyIn) {
          newIds = currentIds.filter((id) => id !== productId);
          set({
            productIds: newIds,
            items: get().items.filter((item) => item.id !== productId),
          });

          if (isAuth) {
            try {
              await api.delete(`/Wishlist/remove?productId=${productId}`);
            } catch {}
          }
        } else {
          newIds = [...currentIds, productId];
          set({ productIds: newIds });

          if (isAuth) {
            try {
              await api.post('/Wishlist/add', { productIds: [productId] });
            } catch {}
          }
        }

        return !isCurrentlyIn;
      },

      clearWishlist: () => set({ productIds: [], items: [] }),
    }),
    {
      name: 'wallsshop-wishlist-storage',
      partialize: (state) => ({
        productIds: state.productIds,
      }),
    }
  )
);
