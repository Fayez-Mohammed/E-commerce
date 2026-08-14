import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, OrderSummary, CartResponse } from '@/types';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

interface CartState {
  items: CartItem[];
  summary: OrderSummary;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  fetchCartCount: () => Promise<number>;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  updateQuantity: (productId: number, variantId: number, quantity: number, colorId: number) => Promise<void>;
  removeItem: (productId: number, variantId: number, colorId: number) => Promise<void>;
  revalidateCartItems: () => Promise<void>;
  clearCart: () => void;
  getGuestCartPayload: () => { userId: string; shoppingCart: { userId: string; items: CartItem[] } };
}

const defaultSummary: OrderSummary = {
  totalOriginalPrice: 0,
  totalDiscount: 0,
  totalPrice: 0,
  totalProductsCount: 0,
  count: 0,
};

// Unique composite key helper for items: (ProductId_VariantId_ColorId)
export const getCartItemKey = (item: { productId: number; variantId?: number; colorId?: number }): string => {
  const pId = Number(item.productId) || 0;
  const vId = Number(item.variantId) || 0;
  const cId = Number(item.colorId) || 0;
  return `${pId}_${vId}_${cId}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      summary: defaultSummary,
      isOpen: false,
      isLoading: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      /**
       * Get guest cart payload formatted for GetCartDto (strictly deduplicated)
       */
      getGuestCartPayload: () => {
        const currentItems = get().items;
        const dedupedMap = new Map<string, CartItem>();

        for (const item of currentItems) {
          const key = getCartItemKey(item);
          if (dedupedMap.has(key)) {
            const existing = dedupedMap.get(key)!;
            existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
          } else {
            dedupedMap.set(key, {
              productId: Number(item.productId) || 0,
              variantId: Number(item.variantId) || 0,
              productName: item.productName || '',
              type: item.type || '',
              size: item.size || '',
              color: item.color || '',
              colorId: Number(item.colorId) || 0,
              englishColor: item.englishColor || '',
              unitPrice: Number(item.unitPrice) || 0,
              originalPrice: Number(item.originalPrice) || Number(item.unitPrice) || 0,
              quantity: Number(item.quantity) || 1,
              imageUrl: item.imageUrl || '',
            });
          }
        }

        return {
          userId: '',
          shoppingCart: {
            userId: '',
            items: Array.from(dedupedMap.values()),
          },
        };
      },

      /**
       * Fetch cart items and summary from backend
       * Endpoint: POST /api/Cart/get-cart
       */
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const isAuth = useAuthStore.getState().isAuthenticated;
          const payload = isAuth ? {} : get().getGuestCartPayload();

          const res = await api.post<CartResponse>('/Cart/get-cart', payload);
          if (res.data) {
            // Deduplicate items returned from backend
            const backendItems = res.data.items || [];
            const dedupedBackendMap = new Map<string, CartItem>();

            for (const item of backendItems) {
              const key = getCartItemKey(item);
              if (dedupedBackendMap.has(key)) {
                const existing = dedupedBackendMap.get(key)!;
                existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
              } else {
                dedupedBackendMap.set(key, {
                  ...item,
                  productId: Number(item.productId),
                  variantId: Number(item.variantId || 0),
                  colorId: Number(item.colorId || 0),
                });
              }
            }

            const cleanItems = Array.from(dedupedBackendMap.values());
            set({
              items: cleanItems,
              summary: res.data.summary || defaultSummary,
              isLoading: false,
            });
          }
        } catch {
          // If offline or error, compute local summary
          const items = get().items;
          const totalOriginalPrice = items.reduce(
            (acc, i) => acc + (Number(i.originalPrice) || Number(i.unitPrice)) * (Number(i.quantity) || 1),
            0
          );
          const totalPrice = items.reduce(
            (acc, i) => acc + Number(i.unitPrice) * (Number(i.quantity) || 1),
            0
          );
          const totalProductsCount = items.reduce(
            (acc, i) => acc + (Number(i.quantity) || 1),
            0
          );
          set({
            summary: {
              totalOriginalPrice,
              totalPrice,
              totalDiscount: totalPrice - totalOriginalPrice,
              totalProductsCount,
              count: items.length,
            },
            isLoading: false,
          });
        }
      },

      /**
       * Get items count in cart
       * Endpoint: POST /api/Cart/get-Count-Of-cart or GET /api/Cart/CountOfItemsInCartForUser
       */
      fetchCartCount: async (): Promise<number> => {
        try {
          const isAuth = useAuthStore.getState().isAuthenticated;
          if (isAuth) {
            const res = await api.get<{ count?: number; Count?: number }>('/Cart/CountOfItemsInCartForUser');
            return res.data?.count ?? res.data?.Count ?? get().items.length;
          } else {
            const payload = get().getGuestCartPayload();
            const res = await api.post<number>('/Cart/get-Count-Of-cart', payload);
            return typeof res.data === 'number' ? res.data : get().items.length;
          }
        } catch {
          return get().items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
        }
      },

      /**
       * Add item to cart
       * Endpoint: POST /api/Cart/add-item (if authenticated)
       */
      addItem: async (itemData) => {
        const isAuth = useAuthStore.getState().isAuthenticated;
        const quantityToAdd = Number(itemData.quantity) || 1;
        const targetKey = getCartItemKey(itemData);
        const currentItems = [...get().items];

        const existingIndex = currentItems.findIndex((i) => getCartItemKey(i) === targetKey);

        if (existingIndex > -1) {
          // Increment quantity and update product attributes to current language
          currentItems[existingIndex] = {
            ...currentItems[existingIndex],
            productName: itemData.productName || currentItems[existingIndex].productName,
            color: itemData.color || currentItems[existingIndex].color,
            englishColor: itemData.englishColor || currentItems[existingIndex].englishColor,
            type: itemData.type || currentItems[existingIndex].type,
            size: itemData.size || currentItems[existingIndex].size,
            unitPrice: itemData.unitPrice || currentItems[existingIndex].unitPrice,
            originalPrice: itemData.originalPrice || currentItems[existingIndex].originalPrice,
            imageUrl: itemData.imageUrl || currentItems[existingIndex].imageUrl,
            quantity: (Number(currentItems[existingIndex].quantity) || 0) + quantityToAdd,
          };
        } else {
          currentItems.push({
            ...itemData,
            productId: Number(itemData.productId),
            variantId: Number(itemData.variantId || 0),
            colorId: Number(itemData.colorId || 0),
            quantity: quantityToAdd,
            originalPrice: itemData.originalPrice || itemData.unitPrice,
          });
        }

        set({ items: currentItems, isOpen: true });

        if (isAuth) {
          try {
            await api.post('/Cart/add-item', {
              productId: Number(itemData.productId),
              variantId: Number(itemData.variantId || 0),
              productName: itemData.productName,
              type: itemData.type || '',
              size: itemData.size || '',
              color: itemData.color || '',
              colorId: Number(itemData.colorId || 0),
              englishColor: itemData.englishColor || '',
              unitPrice: Number(itemData.unitPrice),
              originalPrice: Number(itemData.originalPrice || itemData.unitPrice),
              quantity: quantityToAdd,
              imageUrl: itemData.imageUrl || '',
            });
          } catch {}
        }

        await get().fetchCart();
      },

      /**
       * Update item quantity
       * Endpoint: POST /api/Cart/update-quantity
       */
      updateQuantity: async (productId, variantId, quantity, colorId) => {
        const pId = Number(productId);
        const vId = Number(variantId || 0);
        const cId = Number(colorId || 0);
        const targetKey = getCartItemKey({ productId: pId, variantId: vId, colorId: cId });

        if (quantity <= 0) {
          return get().removeItem(pId, vId, cId);
        }

        const isAuth = useAuthStore.getState().isAuthenticated;
        const currentItems = get().items.map((item) => {
          if (getCartItemKey(item) === targetKey) {
            return { ...item, quantity };
          }
          return item;
        });

        set({ items: currentItems });

        if (isAuth) {
          try {
            const res = await api.post<CartResponse>('/Cart/update-quantity', {
              productId: pId,
              varianceId: vId,
              quantity,
              colorId: cId,
            });
            if (res.data) {
              set({
                items: res.data.items || [],
                summary: res.data.summary || defaultSummary,
              });
              return;
            }
          } catch {}
        }

        await get().fetchCart();
      },

      /**
       * Remove item from cart
       * Endpoint: DELETE /api/Cart/delete-item
       */
      removeItem: async (productId, variantId, colorId) => {
        const pId = Number(productId);
        const vId = Number(variantId || 0);
        const cId = Number(colorId || 0);
        const targetKey = getCartItemKey({ productId: pId, variantId: vId, colorId: cId });

        const isAuth = useAuthStore.getState().isAuthenticated;
        const filteredItems = get().items.filter(
          (item) => getCartItemKey(item) !== targetKey
        );

        set({ items: filteredItems });

        if (isAuth) {
          try {
            const res = await api.delete<CartResponse>('/Cart/delete-item', {
              data: {
                productId: pId,
                varianceId: vId,
                quantity: 0,
                colorId: cId,
              },
            });
            if (res.data) {
              set({
                items: res.data.items || [],
                summary: res.data.summary || defaultSummary,
              });
              return;
            }
          } catch {}
        }

        await get().fetchCart();
      },

      /**
       * Revalidate cart items with backend
       * Endpoint: POST /api/Cart/Update-cart-items
       */
      revalidateCartItems: async () => {
        try {
          const isAuth = useAuthStore.getState().isAuthenticated;
          const payload = isAuth ? {} : get().getGuestCartPayload();
          const res = await api.post<CartResponse>('/Cart/Update-cart-items', payload);
          if (res.data) {
            set({
              items: res.data.items || [],
              summary: res.data.summary || defaultSummary,
            });
          }
        } catch {}
      },

      clearCart: () => {
        set({ items: [], summary: defaultSummary });
      },
    }),
    {
      name: 'wallsshop-cart-storage',
      partialize: (state) => ({
        items: state.items,
        summary: state.summary,
      }),
    }
  )
);
