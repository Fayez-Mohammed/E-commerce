import { api } from './api';
import { CartItem } from '@/types';

export interface LoginParams {
  email: string;
  password: string;
  guestItems?: CartItem[];
  guestWishlistIds?: number[];
}

export interface RegisterParams {
  displayName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateUserParams {
  email: string;
  name?: string;
  phoneNumber?: string;
}

export const authService = {
  /**
   * Login user with optional cached guest cart & wishlist synchronization
   * Endpoint: POST /api/Account/login
   */
  login: async ({
    email,
    password,
    guestItems,
    guestWishlistIds,
  }: LoginParams): Promise<{ email: string; token: string }> => {
    const payload: any = {
      email: email.trim(),
      password: password.trim(),
    };

    // Include cached items in payload if present
    if (guestItems && guestItems.length > 0) {
      payload.item = {
        userId: '',
        items: guestItems.map((item) => ({
          productId: item.productId || 0,
          variantId: item.variantId || 0,
          productName: item.productName || '',
          type: item.type || '',
          size: item.size || '',
          color: item.color || '',
          colorId: item.colorId || 0,
          englishColor: item.englishColor || '',
          unitPrice: item.unitPrice || 0,
          originalPrice: item.originalPrice || item.unitPrice || 0,
          quantity: item.quantity || 1,
          imageUrl: item.imageUrl || '',
        })),
      };
    }

    // Include cached wishlist in payload if present
    if (guestWishlistIds && guestWishlistIds.length > 0) {
      payload.wishlist = {
        productIds: guestWishlistIds,
      };
    }

    const res = await api.post<any>('/Account/login', payload);
    const data = res.data;

    // Handle token string or serialized Task<string> object { result: "..." }
    let tokenStr = '';
    if (typeof data?.token === 'string') {
      tokenStr = data.token;
    } else if (data?.token?.result && typeof data.token.result === 'string') {
      tokenStr = data.token.result;
    } else if (typeof data?.Token === 'string') {
      tokenStr = data.Token;
    } else if (data?.Token?.result && typeof data.Token.result === 'string') {
      tokenStr = data.Token.result;
    } else if (typeof data?.response?.token === 'string') {
      tokenStr = data.response.token;
    } else if (data?.response?.token?.result) {
      tokenStr = data.response.token.result;
    }

    const emailStr = data?.email || data?.Email || data?.response?.email || email;

    return {
      email: emailStr,
      token: tokenStr,
    };
  },

  register: async (params: RegisterParams): Promise<string> => {
    const res = await api.post<any>('/Account/register', params);
    return res.data?.response ?? res.data?.message ?? 'Registered successfully';
  },

  confirmEmail: async (token: string, email: string): Promise<string> => {
    const res = await api.post<any>('/Account/confirm-email', {
      token,
      email,
    });
    return res.data?.response ?? res.data?.message ?? 'Email confirmed';
  },

  forgotPassword: async (email: string): Promise<string> => {
    const res = await api.post<any>('/Account/forgot-password', { email });
    return res.data?.response ?? res.data?.message ?? 'OTP sent';
  },

  verifyOtp: async (email: string, otp: string): Promise<{ message: string; resetToken: string }> => {
    const res = await api.post<any>('/Account/verify-otp', {
      email,
      otp,
    });
    const data = res.data;
    return {
      message: data?.message ?? data?.Message ?? 'OTP verified',
      resetToken: data?.resetToken ?? data?.ResetToken ?? '',
    };
  },

  resendOtp: async (email: string): Promise<string> => {
    const res = await api.post<any>('/Account/resend-otp', { email });
    return res.data?.response ?? res.data?.message ?? 'OTP resent';
  },

  resetPassword: async (
    email: string,
    token: string,
    newPassword: string,
    confirmPassword?: string
  ): Promise<string> => {
    const res = await api.post<any>('/Account/reset-password', {
      email,
      token,
      newPassword,
      confirmPassword: confirmPassword || newPassword,
    });
    return res.data?.response ?? res.data?.message ?? 'Password reset successfully';
  },

  updateUserInfo: async (params: UpdateUserParams): Promise<string> => {
    const res = await api.put<any>('/Account/update-user-info', params);
    return res.data?.response ?? res.data?.message ?? 'User info updated';
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string,
    confirmNewPassword?: string
  ): Promise<string> => {
    const res = await api.post<any>('/Account/change-password', {
      oldPassword,
      newPassword,
      confirmNewPassword: confirmNewPassword || newPassword,
    });
    return res.data?.response ?? res.data?.message ?? 'Password changed';
  },
};
