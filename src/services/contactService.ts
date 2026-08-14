import { api } from './api';
import { ContactFormDto } from '@/types';

export const contactService = {
  /**
   * Submit inquiry / contact form
   * Endpoint: POST /api/Form/add-form
   */
  submitForm: async (dto: ContactFormDto): Promise<{ success: boolean; message?: string }> => {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const payload = {
      name: dto.name.trim(),
      email: dto.email.trim(),
      address: dto.address?.trim() || 'Cairo, Egypt',
      phoneNumber: dto.phoneNumber.trim(),
      message: dto.message.trim(),
      date: dto.date || today,
    };
    const res = await api.post<{ message?: string }>('/Form/add-form', payload);
    return { success: true, message: res.data?.message };
  },
};
