import { api } from './api';
import { CategoryItem } from '@/types';

export const categoryService = {
  getCategories: async (): Promise<CategoryItem[]> => {
    const res = await api.get<{ response?: CategoryItem[] }>('/Category/categories');
    return res.data.response || [];
  },
};
