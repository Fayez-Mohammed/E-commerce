import { api } from './api';
import { OfferItem } from '@/types';

export const offerService = {
  /**
   * Get all active promotional campaign offers
   * Endpoint: GET /api/Offers/get-offer
   */
  getOffers: async (): Promise<OfferItem[]> => {
    try {
      const res = await api.get<{
        reponse?: OfferItem | OfferItem[];
        response?: OfferItem | OfferItem[];
        Response?: OfferItem | OfferItem[];
      }>('/Offers/get-offer');
      
      const raw = res.data?.reponse ?? res.data?.response ?? res.data?.Response ?? (res.data as any);
      if (!raw) return [];
      if (Array.isArray(raw)) {
        return raw;
      }
      return [raw];
    } catch (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
  },

  /**
   * Helper to get the first active offer
   */
  getActiveOffer: async (): Promise<OfferItem | null> => {
    try {
      const offers = await offerService.getOffers();
      return offers[0] || null;
    } catch {
      return null;
    }
  },
};
