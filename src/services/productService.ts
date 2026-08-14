import { api } from './api';
import { ProductOverview, ProductDetail, PagedResult, QueryParameters } from '@/types';

export const productService = {
  /**
   * Get paginated products list with optional category, search, order filters
   * Endpoint: GET /api/Product/products
   */
  getProducts: async (params?: QueryParameters): Promise<PagedResult<ProductOverview>> => {
    try {
      const res = await api.get<{ response?: PagedResult<ProductOverview>; Response?: PagedResult<ProductOverview> }>(
        '/Product/products',
        { params }
      );
      const raw = res.data?.response ?? res.data?.Response ?? (res.data as any);

      if (raw && Array.isArray(raw.data)) {
        return {
          data: raw.data,
          totalPages: raw.totalPages ?? 1,
          currentPage: raw.currentPage ?? (params?.page || 1),
          categoryName: raw.categoryName ?? '',
        };
      } else if (Array.isArray(raw)) {
        return {
          data: raw,
          totalPages: 1,
          currentPage: params?.page || 1,
          categoryName: '',
        };
      }
      return { data: [], totalPages: 0, currentPage: 1, categoryName: '' };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: [], totalPages: 0, currentPage: 1, categoryName: '' };
    }
  },

  /**
   * Get single product detail by ID
   * Endpoint: GET /api/Product/product?id=X
   */
  getProductById: async (id: number): Promise<ProductDetail | null> => {
    try {
      const res = await api.get<{
        response?: PagedResult<ProductDetail> | ProductDetail;
        Response?: PagedResult<ProductDetail> | ProductDetail;
      }>('/Product/product', {
        params: { id },
      });
      const raw = res.data?.response ?? res.data?.Response ?? (res.data as any);

      if (raw && Array.isArray(raw.data) && raw.data.length > 0) {
        return raw.data[0];
      } else if (Array.isArray(raw) && raw.length > 0) {
        return raw[0];
      } else if (raw && typeof raw === 'object' && !Array.isArray(raw) && (raw.id || raw.name)) {
        return raw as ProductDetail;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  },

  /**
   * Get related products for a given product
   * Endpoint: GET /api/Product/related-product?id=X&page=1&pageSize=4
   */
  getRelatedProducts: async (id: number, page = 1, pageSize = 4): Promise<ProductOverview[]> => {
    try {
      const res = await api.get<{
        response?: PagedResult<ProductOverview> | ProductOverview[];
        Response?: PagedResult<ProductOverview> | ProductOverview[];
      }>('/Product/related-product', {
        params: { id, page, pageSize },
      });
      const raw = res.data?.response ?? res.data?.Response ?? (res.data as any);

      if (raw && Array.isArray(raw.data)) {
        return raw.data;
      } else if (Array.isArray(raw)) {
        return raw;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching related products for ${id}:`, error);
      return [];
    }
  },

  /**
   * Get top recent arrivals
   * Endpoint: GET /api/Product/top-recent-product?page=1&pageSize=8
   */
  getTopRecentProducts: async (page = 1, pageSize = 8): Promise<ProductOverview[]> => {
    try {
      const res = await api.get<{
        response?: ProductOverview[] | PagedResult<ProductOverview>;
        Response?: ProductOverview[] | PagedResult<ProductOverview>;
      }>('/Product/top-recent-product', {
        params: { page, pageSize },
      });
      const raw = res.data?.response ?? res.data?.Response ?? (res.data as any);

      if (Array.isArray(raw)) {
        return raw;
      } else if (raw && Array.isArray(raw.data)) {
        return raw.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching top recent products:', error);
      return [];
    }
  },

  /**
   * Get top rated products
   * Endpoint: GET /api/Product/top-rated-product?page=1&pageSize=8
   */
  getTopRatedProducts: async (page = 1, pageSize = 8): Promise<ProductOverview[]> => {
    try {
      const res = await api.get<{
        response?: ProductOverview[] | PagedResult<ProductOverview>;
        Response?: ProductOverview[] | PagedResult<ProductOverview>;
      }>('/Product/top-rated-product', {
        params: { page, pageSize },
      });
      const raw = res.data?.response ?? res.data?.Response ?? (res.data as any);

      if (Array.isArray(raw)) {
        return raw;
      } else if (raw && Array.isArray(raw.data)) {
        return raw.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching top rated products:', error);
      return [];
    }
  },
};
