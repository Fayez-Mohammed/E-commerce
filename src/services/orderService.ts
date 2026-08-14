import { api } from './api';
import { CreateOrderDto } from '@/types';

export const orderService = {
  makeOrder: async (dto: CreateOrderDto): Promise<{ message: string; orderId: number }> => {
    const res = await api.post<{ Message: string; OrderId: number }>('/Orders/MakeOrder', dto);
    return {
      message: res.data.Message,
      orderId: res.data.OrderId,
    };
  },
};
