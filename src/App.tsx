import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useLanguageStore } from '@/stores/languageStore';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';

import { ToastProvider } from '@/components/common/Toast';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

// Storefront Pages
import { HomePage } from '@/pages/storefront/HomePage';
import { ShopPage } from '@/pages/storefront/ShopPage';
import { CategoriesPage } from '@/pages/storefront/CategoriesPage';
import { OffersPage } from '@/pages/storefront/OffersPage';
import { ProductDetailsPage } from '@/pages/storefront/ProductDetailsPage';
import { WishlistPage } from '@/pages/storefront/WishlistPage';
import { CheckoutPage } from '@/pages/storefront/CheckoutPage';
import { ContactPage } from '@/pages/storefront/ContactPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ConfirmEmailPage } from '@/pages/auth/ConfirmEmailPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Account Pages
import { ProfilePage } from '@/pages/account/ProfilePage';
import { OrdersPage } from '@/pages/account/OrdersPage';

// Admin Components & Pages
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminOffersPage } from '@/pages/admin/AdminOffersPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Storefront Layout with Header, Footer, and Cart Drawer
const StorefrontLayout: React.FC = () => {
  return (
    <div className="storefront-app">
      <Navbar />
      <main className="storefront-content">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export function App() {
  const { direction, language } = useLanguageStore();
  const { initializeAuth } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  useEffect(() => {
    // Initial sync
    initializeAuth();
    fetchWishlist();
  }, []);

  useEffect(() => {
    // Re-hydrate cart items with latest language translations from backend
    fetchCart();
  }, [language]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Storefront Routes */}
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/confirm-email" element={<ConfirmEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Customer Account Routes */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="offers" element={<AdminOffersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
