import { api } from './api';
import {
  DashboardSummary,
  OrderDashboardDto,
  OrderFullDetail,
  CustomerReturnDto,
  DashboardCategory,
  DashboardOffer,
  PagedResult,
  QueryParameters,
  SingleReview,
} from '@/types';

export const adminService = {
  // Summary KPI
  getSummary: async (): Promise<DashboardSummary> => {
    try {
      const res = await api.get<{ success?: boolean; data?: DashboardSummary }>('/dashboard/DashBoard/summary');
      return (
        res.data?.data || {
          totalProducts: 0,
          totalCategories: 0,
          totalOffers: 0,
          totalUsers: 0,
          totalOrders: 0,
          totalSales: 0,
        }
      );
    } catch {
      return {
        totalProducts: 0,
        totalCategories: 0,
        totalOffers: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalSales: 0,
      };
    }
  },

  // Products
  getProductsForDashboard: async (params?: QueryParameters): Promise<PagedResult<any>> => {
    try {
      const res = await api.get<{ response?: PagedResult<any>; Response?: PagedResult<any> }>(
        '/dashboard/DashBoard/productsForDashboard',
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
    } catch {
      return { data: [], totalPages: 0, currentPage: 1, categoryName: '' };
    }
  },

  getProductForEdit: async (id: number): Promise<any> => {
    try {
      const res = await api.get<{ success?: boolean; data?: any }>('/dashboard/DashBoard/GetProductForEdit', {
        params: { id },
      });
      const d = res.data?.data;
      if (Array.isArray(d)) return d[0] || null;
      return d || null;
    } catch {
      return null;
    }
  },

  addProduct: async (formData: FormData): Promise<boolean> => {
    const res = await api.post('/dashboard/DashBoard/add-product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return !!res.data;
  },

  updateProduct: async (formData: FormData): Promise<boolean> => {
    const res = await api.put('/dashboard/DashBoard/update-product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return !!res.data;
  },

  deleteProduct: async (id: number): Promise<boolean> => {
    await api.delete('/dashboard/DashBoard/delete-product', {
      params: { id },
    });
    return true;
  },

  // Orders
  getAllOrders: async (): Promise<OrderDashboardDto[]> => {
    try {
      const res = await api.get<OrderDashboardDto[] | { response?: OrderDashboardDto[] }>(
        '/dashboard/DashBoard/GetAllOrders'
      );
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray((res.data as any).response)) return (res.data as any).response;
      return [];
    } catch {
      return [];
    }
  },

  getOrderDetails: async (id: number): Promise<OrderFullDetail | null> => {
    try {
      const res = await api.get<OrderFullDetail | { response?: OrderFullDetail }>(
        '/dashboard/DashBoard/GetOrderDetails',
        {
          params: { id },
        }
      );
      const data = (res.data as any)?.response ?? res.data;
      return data || null;
    } catch {
      return null;
    }
  },

  confirmOrder: async (id: number): Promise<boolean> => {
    await api.put('/dashboard/DashBoard/ConfirmOrder', null, {
      params: { id },
    });
    return true;
  },

  cancelOrder: async (id: number): Promise<boolean> => {
    await api.put('/dashboard/DashBoard/CancelOrder', null, {
      params: { id },
    });
    return true;
  },

  deleteOrder: async (id: number): Promise<boolean> => {
    await api.delete('/dashboard/DashBoard/Delete-Order', {
      params: { id },
    });
    return true;
  },

  downloadOrdersXml: async (): Promise<void> => {
    const res = await api.get('/dashboard/DashBoard/DownloadOrdersXml', {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WallsShop_Orders_${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Customers & Users
  getAllCustomers: async (): Promise<CustomerReturnDto[]> => {
    try {
      const res = await api.get<{ success?: boolean; data?: CustomerReturnDto[] }>(
        '/dashboard/DashBoard/GetAllCustomers'
      );
      const list = res.data?.data || [];
      return list.map((c) => ({
        ...c,
        name: c.userName,
        isBlocked: c.status?.toLowerCase() === 'blocked' || c.status === 'محظور',
      }));
    } catch {
      return [];
    }
  },

  blockUser: async (userId: string): Promise<string> => {
    const res = await api.put<{ response?: string }>('/dashboard/DashBoard/BlockUser', null, {
      params: { userId },
    });
    return res.data?.response ?? 'User blocked';
  },

  unblockUser: async (userId: string): Promise<string> => {
    const res = await api.put<{ response?: string }>('/dashboard/DashBoard/UnBlockUser', null, {
      params: { userId },
    });
    return res.data?.response ?? 'User unblocked';
  },

  toggleBlockCustomer: async (userId: string): Promise<string> => {
    const res = await api.put<{ response?: string }>('/dashboard/DashBoard/ToggleBlock', null, {
      params: { userId },
    });
    return res.data?.response ?? 'Status updated';
  },

  deleteCustomer: async (id: string): Promise<string> => {
    const res = await api.delete<{ response?: string }>('/dashboard/DashBoard/DeleteCustomer', {
      params: { id },
    });
    return res.data?.response ?? 'Deleted successfully';
  },

  registerAdmin: async (adminData: {
    email: string;
    displayName: string;
    phoneNumber: string;
    password: string;
  }): Promise<any> => {
    const res = await api.post('/dashboard/DashBoard/AddAdmin', {
      Email: adminData.email,
      Name: adminData.displayName,
      PhoneNumber: adminData.phoneNumber,
      Password: adminData.password,
    });
    return res.data;
  },

  addAdmin: async (adminData: { email: string; name: string; phoneNumber: string; password: string }): Promise<any> => {
    const res = await api.post('/dashboard/DashBoard/AddAdmin', {
      Email: adminData.email,
      Name: adminData.name,
      PhoneNumber: adminData.phoneNumber,
      Password: adminData.password,
    });
    return res.data;
  },

  // Reviews
  getAllReviews: async (): Promise<SingleReview[]> => {
    try {
      const res = await api.get<{ response?: SingleReview[]; data?: SingleReview[] }>('/Review/all-reviews-admin');
      const list = res.data?.response ?? res.data?.data ?? [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  // Categories CRUD
  getAllCategories: async (): Promise<DashboardCategory[]> => {
    try {
      const res = await api.get<{ success?: boolean; data?: DashboardCategory[] }>('/dashboard/DashboardCategories');
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  createCategory: async (formData: FormData): Promise<any> => {
    const res = await api.post('/dashboard/DashboardCategories/CreateCategory', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateCategory: async (id: number, formData: FormData): Promise<any> => {
    const res = await api.put('/dashboard/DashboardCategories/UpdateCategory', formData, {
      params: { id },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteCategory: async (id: number): Promise<boolean> => {
    await api.delete('/dashboard/DashboardCategories/DeleteCategory', {
      params: { id },
    });
    return true;
  },

  // Offers CRUD
  getAllOffers: async (): Promise<DashboardOffer[]> => {
    try {
      const res = await api.get<{ success?: boolean; data?: DashboardOffer[] }>(
        '/dashboard/DashboardOffers/GetOffers'
      );
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  getSpecificOffer: async (id: number): Promise<DashboardOffer | null> => {
    try {
      const res = await api.get<{ success?: boolean; data?: DashboardOffer }>(
        '/dashboard/DashboardOffers/SpecificOffer',
        { params: { id } }
      );
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  createOffer: async (formData: FormData): Promise<any> => {
    const res = await api.post('/dashboard/DashboardOffers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateOffer: async (id: number, formData: FormData): Promise<any> => {
    const res = await api.put('/dashboard/DashboardOffers/UpdateOffer', formData, {
      params: { id },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteOffer: async (id: number): Promise<boolean> => {
    await api.delete('/dashboard/DashboardOffers/DeleteOffer', {
      params: { id },
    });
    return true;
  },
};
