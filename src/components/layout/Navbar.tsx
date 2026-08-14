import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Globe,
  LayoutDashboard,
  LogOut,
  Package,
  ChevronDown,
  Sparkles,
  Phone,
  Layers,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguageStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { items: cartItems, openCart } = useCartStore();
  const { productIds } = useWishlistStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Total cart item quantity
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = productIds.length;

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname, location.search]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Hide header on scroll down, show on scroll up
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY <= 60) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY.current + 8) {
            // Scrolling down
            if (!isMobileMenuOpen) {
              setIsVisible(false);
              setIsUserMenuOpen(false);
            }
          } else if (currentScrollY < lastScrollY.current - 8) {
            // Scrolling up
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={`${styles.header} ${!isVisible ? styles.headerHidden : ''}`}>
      {/* Top Notification & Utility Strip */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarContent}`}>
          <div className={styles.announcement}>
            <Sparkles size={13} className={styles.sparkleIcon} />
            <span>
              {language === 'ar'
                ? 'شحن وتوصيل لكافة محافظات مصر | ضمان جودة الأخشاب الطبيعية'
                : 'Free delivery across Egypt | Premium Solid Wood Guarantee'}
            </span>
          </div>

          <div className={styles.topBarActions}>
            <a href="tel:01027016323" className={styles.phoneLink}>
              <Phone size={12} />
              <span>01027016323</span>
            </a>

            <button
              onClick={toggleLanguage}
              className={styles.langBtn}
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Globe size={13} />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Consolidated Navigation Header */}
      <div className={styles.mainNav}>
        <div className={`container ${styles.navContent}`}>
          {/* Mobile Menu Toggle Button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <span className={styles.logoLetter}>W</span>
            </div>
            <div className={styles.logoText}>
              <span className={styles.brandTitle}>WALLSSHOP</span>
              <span className={styles.brandSubtitle}>FURNITURE</span>
            </div>
          </Link>

          {/* Desktop Center Navigation Menu */}
          <nav className={styles.centerNav}>
            <Link
              to="/"
              className={`${styles.navLink} ${location.pathname === '/' ? styles.navLinkActive : ''}`}
            >
              {t('home')}
            </Link>

            <Link
              to="/shop"
              className={`${styles.navLink} ${location.pathname === '/shop' ? styles.navLinkActive : ''}`}
            >
              {t('shop')}
            </Link>

            {/* Direct Categories Page Link */}
            <Link
              to="/categories"
              className={`${styles.navLink} ${location.pathname === '/categories' ? styles.navLinkActive : ''}`}
            >
              {t('categories')}
            </Link>

            {/* Direct Offers Page Link */}
            <Link
              to="/offers"
              className={`${styles.navLink} ${styles.offersHighlight} ${location.pathname === '/offers' ? styles.navLinkActive : ''}`}
            >
              <Sparkles size={14} className={styles.offerIcon} />
              <span>{t('offers')}</span>
            </Link>

            <Link
              to="/contact"
              className={`${styles.navLink} ${location.pathname === '/contact' ? styles.navLinkActive : ''}`}
            >
              {t('contact')}
            </Link>
          </nav>

          {/* Right Utilities & Actions */}
          <div className={styles.rightActions}>
            {/* Integrated Search Bar */}
            <div className={styles.searchContainer} ref={searchContainerRef}>
              <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث عن أثاث...' : 'Search furniture...'}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchSubmitBtn} aria-label="Search">
                  <Search size={16} />
                </button>
              </form>
            </div>

            {/* Wishlist Button */}
            <Link to="/wishlist" className={styles.iconBtn} aria-label={t('wishlist')} title={t('wishlist')}>
              <Heart size={20} />
              {wishlistCount > 0 && <span className={styles.countBadge}>{wishlistCount}</span>}
            </Link>

            {/* Cart Button */}
            <button onClick={openCart} className={styles.iconBtn} aria-label={t('cart')} title={t('cart')}>
              <ShoppingBag size={20} />
              {totalCartCount > 0 && <span className={styles.countBadge}>{totalCartCount}</span>}
            </button>

            {/* User Account / Auth */}
            <div className={styles.userMenuWrapper} ref={userMenuRef}>
              {isAuthenticated && user ? (
                <button
                  className={styles.userAvatarBtn}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  title={user.name}
                >
                  <div className={styles.userAvatar}>
                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                  </div>
                  <span className={styles.userFirstName}>
                    {user.name?.split(' ')[0] || t('account')}
                  </span>
                  <ChevronDown size={12} className={styles.chevron} />
                </button>
              ) : (
                <Link to="/login" className={styles.loginBtn}>
                  <User size={16} />
                  <span>{t('login')}</span>
                </Link>
              )}

              {/* User Dropdown */}
              {isUserMenuOpen && isAuthenticated && user && (
                <div className={styles.userDropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownName}>{user.name}</p>
                    <p className={styles.dropdownEmail}>{user.email}</p>
                  </div>

                  <div className={styles.dropdownDivider} />

                  {isAdmin && (
                    <Link to="/admin" className={styles.dropdownItem}>
                      <LayoutDashboard size={15} />
                      <span>{t('dashboard')}</span>
                    </Link>
                  )}

                  <Link to="/profile" className={styles.dropdownItem}>
                    <User size={15} />
                    <span>{t('profile')}</span>
                  </Link>

                  <Link to="/orders" className={styles.dropdownItem}>
                    <Package size={15} />
                    <span>{t('myOrders')}</span>
                  </Link>

                  <div className={styles.dropdownDivider} />

                  <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutItem}`}>
                    <LogOut size={15} />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileDrawerContent}>
            {/* Search in mobile */}
            <form className={styles.mobileSearchForm} onSubmit={handleSearchSubmit}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className={styles.mobileSearchInput}
              />
              <button type="submit" className={styles.mobileSearchBtn}>
                <Search size={18} />
              </button>
            </form>

            <div className={styles.mobileNavLinks}>
              <Link to="/" className={styles.mobileNavItem}>
                {t('home')}
              </Link>
              <Link to="/shop" className={styles.mobileNavItem}>
                {t('shop')}
              </Link>
              <Link to="/categories" className={styles.mobileNavItem}>
                <Layers size={18} />
                <span>{t('categories')}</span>
              </Link>

              <Link to="/offers" className={`${styles.mobileNavItem} ${styles.offersLink}`}>
                <Sparkles size={16} />
                <span>{t('offers')}</span>
              </Link>

              <Link to="/wishlist" className={styles.mobileNavItem}>
                <Heart size={16} />
                <span>
                  {t('wishlist')} {wishlistCount > 0 && `(${wishlistCount})`}
                </span>
              </Link>

              <Link to="/contact" className={styles.mobileNavItem}>
                {t('contact')}
              </Link>

              <div className={styles.mobileDivider} />

              {isAdmin && (
                <Link to="/admin" className={`${styles.mobileNavItem} ${styles.adminLink}`}>
                  <LayoutDashboard size={16} />
                  <span>{t('dashboard')}</span>
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <Link to="/profile" className={styles.mobileNavItem}>
                    <User size={16} />
                    <span>{t('profile')}</span>
                  </Link>
                  <Link to="/orders" className={styles.mobileNavItem}>
                    <Package size={16} />
                    <span>{t('myOrders')}</span>
                  </Link>
                  <button onClick={handleLogout} className={`${styles.mobileNavItem} ${styles.logoutItem}`}>
                    <LogOut size={16} />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className={`${styles.mobileNavItem} ${styles.loginLink}`}>
                  <User size={16} />
                  <span>{t('login')} / {t('register')}</span>
                </Link>
              )}
            </div>

            {/* Mobile Footer with Language & Hotline */}
            <div className={styles.mobileDrawerFooter}>
              <button onClick={toggleLanguage} className={styles.mobileLangBtn}>
                <Globe size={16} />
                <span>{language === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
              </button>
              <a href="tel:01027016323" className={styles.mobilePhoneBtn}>
                <Phone size={14} />
                <span>01027016323</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
