import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo } from '@/types';
import { api } from '@/services/api';

const decodeJwt = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const checkIsAdmin = (user: UserInfo | null, claims: any | null): boolean => {
  if (user) {
    if (typeof user.role === 'string') {
      const r = (user.role as string).toLowerCase();
      if (r === 'admin' || r === 'systemadmin') return true;
    } else if (Array.isArray(user.role)) {
      if (user.role.some((r) => r.toLowerCase() === 'admin' || r.toLowerCase() === 'systemadmin')) return true;
    }
    if (
      user.email?.toLowerCase() === 'fayez00mohammed@gmail.com' ||
      user.email?.toLowerCase() === 'wallsshop@gmail.com'
    ) {
      return true;
    }
  }

  if (claims) {
    const roleClaim =
      claims.role ||
      claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      claims.Role;
    if (typeof roleClaim === 'string') {
      const r = roleClaim.toLowerCase();
      if (r === 'admin' || r === 'systemadmin') return true;
    } else if (Array.isArray(roleClaim)) {
      if (roleClaim.some((r: string) => r.toLowerCase() === 'admin' || r.toLowerCase() === 'systemadmin')) return true;
    }
    const emailClaim =
      claims.email ||
      claims.unique_name ||
      claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    if (
      emailClaim?.toLowerCase() === 'fayez00mohammed@gmail.com' ||
      emailClaim?.toLowerCase() === 'wallsshop@gmail.com'
    ) {
      return true;
    }
  }

  return false;
};

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setAuth: (token: string, email?: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
  fetchCurrentUser: () => Promise<UserInfo | null>;
  updateUser: (updated: Partial<UserInfo>) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,

      initializeAuth: async () => {
        const token = get().token || localStorage.getItem('wallsshop-token');
        if (token) {
          const claims = decodeJwt(token);
          const isAdmin = checkIsAdmin(get().user, claims);
          set({ isAuthenticated: true, isAdmin });
          await get().fetchCurrentUser();
        }
      },

      setAuth: async (token: string, email?: string) => {
        localStorage.setItem('wallsshop-token', token);
        const claims = decodeJwt(token);

        const initialEmail = email || claims?.email || claims?.unique_name || '';
        const initialName = claims?.name || claims?.unique_name || initialEmail.split('@')[0] || '';
        const role = claims?.role ? (Array.isArray(claims.role) ? claims.role : [claims.role]) : [];
        const isAdmin = checkIsAdmin(null, claims);

        const initialUser: UserInfo = {
          email: initialEmail,
          name: initialName,
          phoneNumber: '',
          role,
        };

        set({
          token,
          user: initialUser,
          isAuthenticated: true,
          isAdmin,
          isLoading: false,
        });

        // Background fetch for detailed profile
        try {
          await get().fetchCurrentUser();
        } catch {}
      },

      fetchCurrentUser: async () => {
        const token = get().token || localStorage.getItem('wallsshop-token');
        if (!token) return null;
        try {
          const res = await api.get<UserInfo>('/Account/user-info');
          const user = res.data;
          const claims = decodeJwt(token);
          const isAdmin = checkIsAdmin(user, claims);
          set({ user, isAuthenticated: true, isAdmin });
          return user;
        } catch (error) {
          return null;
        }
      },

      updateUser: (updated) => {
        const current = get().user;
        if (current) {
          const newUser = { ...current, ...updated };
          const isAdmin = checkIsAdmin(newUser, null);
          set({ user: newUser, isAdmin });
        }
      },

      logout: async () => {
        try {
          await api.post('/Account/logout').catch(() => {});
        } finally {
          localStorage.removeItem('wallsshop-token');
          localStorage.removeItem('wallsshop-user');
          set({ token: null, user: null, isAuthenticated: false, isAdmin: false });
        }
      },
    }),
    {
      name: 'wallsshop-auth-session',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);

// Global unauthorized event handler
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  });
}
