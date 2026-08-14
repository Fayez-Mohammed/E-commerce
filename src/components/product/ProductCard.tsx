import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { ProductOverview } from '@/types';
import { useLanguageStore } from '@/stores/languageStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/common/Toast';
import { getImageUrl } from '@/services/api';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: ProductOverview;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, t } = useLanguageStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { success } = useToast();

  const isFavorited = isInWishlist(product.id);
  const hasDiscount = product.priceAfterDiscount > 0 && product.priceAfterDiscount < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100)
    : 0;

  const currentPrice = hasDiscount ? product.priceAfterDiscount : product.price;
  const originalPrice = product.price;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      variantId: 0,
      productName: product.name,
      type: '',
      size: '',
      color: '',
      colorId: 0,
      englishColor: '',
      unitPrice: currentPrice,
      originalPrice: originalPrice,
      imageUrl: product.imageUrl || '',
      quantity: 1,
    });
    success(t('addedToCart'));
  };

  const categoryName = language === 'ar' ? product.categoryAr : product.categoryEn || product.categoryValue;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Link to={`/product/${product.id}`} className={styles.imageLink}>
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            loading="lazy"
            className={styles.image}
          />
        </Link>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className={styles.discountBadge}>
            <span>-{discountPercent}%</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          className={`${styles.wishlistBtn} ${isFavorited ? styles.active : ''}`}
          onClick={handleWishlistClick}
          aria-label={isFavorited ? t('removeFromWishlist') : t('addToWishlist')}
        >
          <Heart size={18} className={isFavorited ? styles.heartFilled : ''} />
        </button>

        {/* Quick Add Overlay */}
        <div className={styles.quickAddOverlay}>
          <button className={styles.quickAddBtn} onClick={handleQuickAdd}>
            <ShoppingBag size={16} />
            <span>{t('addToCart')}</span>
          </button>
        </div>
      </div>

      <div className={styles.details}>
        {categoryName && <span className={styles.category}>{categoryName}</span>}

        <h3 className={styles.title}>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Rating */}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            <Star size={13} className={styles.starIcon} />
            <span className={styles.ratingNumber}>
              {Number(product.averageRatingPeople || 5).toFixed(1)}
            </span>
          </div>
          {product.totalPeopleRating ? (
            <span className={styles.reviewCount}>({product.totalPeopleRating})</span>
          ) : null}
        </div>

        {/* Price Row */}
        <div className={styles.priceRow}>
          <div className={styles.prices}>
            <span className={styles.currentPrice}>
              {currentPrice.toLocaleString()} {t('currency')}
            </span>
            {hasDiscount && (
              <span className={styles.originalPrice}>
                {originalPrice.toLocaleString()} {t('currency')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
