import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Sparkles,
  Users,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  LogOut,
  Store,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import styles from './AdminLayout.module.css';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { t, language, direction } = useLanguageStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isRtl = direction === 'rtl';

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className={`container ${styles.unauthorizedContainer}`}>
        <div className={styles.unauthorizedCard}>
          <ShieldAlert size={64} className={styles.alertIcon} />
          <h2>{language === 'ar' ? 'غير مصرح لك بالدخول' : 'Access Restricted'}</h2>
          <p>
            {language === 'ar'
              ? 'هذه اللوحة مخصصة فقط لإدارة متجر WallsShop Furniture.'
              : 'This administrative portal is restricted to authorized store administrators.'}
          </p>
          <Link to="/" className={styles.backHomeBtn}>
            <span>{t('backToHome')}</span>
            {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/admin', label: t('adminOverview'), icon: <LayoutDashboard size={18} />, exact: true },
    { to: '/admin/products', label: t('adminProducts'), icon: <Package size={18} /> },
    { to: '/admin/orders', label: t('adminOrders'), icon: <ShoppingBag size={18} /> },
    { to: '/admin/categories', label: t('adminCategories'), icon: <Layers size={18} /> },
    { to: '/admin/offers', label: t('adminOffers'), icon: <Sparkles size={18} /> },
    { to: '/admin/users', label: t('adminCustomers'), icon: <Users size={18} /> },
    { to: '/admin/reviews', label: t('adminReviews'), icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.brandLogo}>
            <div className={styles.logoBadge}>W</div>
            <div>
              <span className={styles.brandTitle}>WALLSSHOP</span>
              <span className={styles.adminTag}>ADMIN CONSOLE</span>
            </div>
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${styles.navLink} ${isActive ? styles.navActive : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link to="/" className={styles.storeLink}>
            <Store size={18} />
            <span>{language === 'ar' ? 'معاينة المتجر' : 'Storefront'}</span>
          </Link>

          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className={styles.logoutBtn}
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainWrapper}>
        <header className={styles.adminHeader}>
          <div className={styles.headerTitle}>
            <h2>{t('adminDashboard')}</h2>
          </div>

          <div className={styles.headerUser}>
            <div className={styles.adminAvatar}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className={styles.adminDetails}>
              <span className={styles.adminName}>{user?.name}</span>
              <span className={styles.adminEmail}>{user?.email}</span>
            </div>
          </div>
        </header>

        <main className={styles.adminMain}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
