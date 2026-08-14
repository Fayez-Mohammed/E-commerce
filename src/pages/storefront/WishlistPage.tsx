import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useLanguageStore } from '@/stores/languageStore';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/common/SkeletonLoader';
import styles from './WishlistPage.module.css';

export const WishlistPage: React.FC = () => {
  const { items, productIds, isLoading, fetchWishlist, clearWishlist } = useWishlistStore();
  const { t, language, direction } = useLanguageStore();
  const navigate = useNavigate();
  const isRtl = direction === 'rtl';

  useEffect(() => {
    fetchWishlist();
  }, [language]);

  return (
    <div className={`container ${styles.wishlistPage}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('wishlist')}</h1>
          <p className={styles.subtitle}>
            {language === 'ar'
              ? `لديك ${productIds.length} منتجات محفوظة في قائمة الرغبات الخاصة بك`
              : `You have ${productIds.length} pieces saved in your design wishlist`}
          </p>
        </div>

        {productIds.length > 0 && (
          <button className={styles.clearBtn} onClick={clearWishlist}>
            <Trash2 size={16} />
            <span>{language === 'ar' ? 'إفراغ المفضلة' : 'Clear Wishlist'}</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className={styles.grid}>
          {items.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Heart size={48} />
          </div>
          <h2>{language === 'ar' ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}</h2>
          <p>
            {language === 'ar'
              ? 'احفظ القطع التي تعجبك أثناء تصفحك للرجوع إليها وشرائها لاحقاً.'
              : 'Save favorite architectural pieces as you browse to revisit anytime.'}
          </p>
          <button className={styles.shopBtn} onClick={() => navigate('/shop')}>
            <span>{t('startShopping')}</span>
            {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>
      )}
    </div>
  );
};
