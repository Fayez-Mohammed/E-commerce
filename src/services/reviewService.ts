import { api } from './api';
import { ReviewResponse, CreateReviewDto, SingleReview } from '@/types';

export const reviewService = {
  getProductReviews: async (productId: number): Promise<ReviewResponse> => {
    const res = await api.get<{ response?: ReviewResponse }>('/Review/reviews', {
      params: { productId },
    });
    return (
      res.data.response || {
        productId,
        averageRating: 0,
        totalReviews: 0,
        singleReviews: [],
      }
    );
  },

  createReview: async (dto: CreateReviewDto): Promise<SingleReview> => {
    const res = await api.post<SingleReview>('/Review/create-review', dto);
    return res.data;
  },

  deleteReview: async (id: number): Promise<boolean> => {
    await api.delete('/Review/delete-review', {
      params: { id },
    });
    return true;
  },

  getAllReviewsAdmin: async (): Promise<any[]> => {
    const res = await api.get<{ response?: any[] }>('/Review/all-reviews-admin');
    return res.data.response || [];
  },
};
