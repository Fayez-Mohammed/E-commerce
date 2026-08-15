import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Users,
  MessageSquare,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/common/Toast';
import { productService } from '@/services/productService';
import { reviewService } from '@/services/reviewService';
import { useSignalRViewer } from '@/hooks/useSignalRViewer';
import { ProductDetail, ProductOverview, ProductVariantDto, ColorDto, ReviewResponse } from '@/types';
import { StarRating } from '@/components/common/StarRating';
import { ProductCard } from '@/components/product/ProductCard';
import { getImageUrl } from '@/services/api';
import styles from './ProductDetailsPage.module.css';

/**
 * Formats size/dimension text with strict BiDi isolation so Width × Depth × Height
 * renders in natural logical order without reversing in RTL or breaking out of cards.
 */
const renderVariantSize = (sizeStr: string | undefined | null) => {
  if (!sizeStr) return null;
  const raw = sizeStr.trim();
  if (!raw) return null;

  // Insert spacing around numbers, units, and multiplication symbols if they are glued together
  // e.g. "العرض220سم×العمق40سم×الارتفاع180سم" -> "العرض 220 سم × العمق 40 سم × الارتفاع 180 سم"
  const spaced = raw
    // Put spaces around multiplier characters ×, *, x, X
    .replace(/\s*([×\*xX])\s*/g, ' × ')
    // Put spaces between letters and digits
    .replace(/([\u0600-\u06FFa-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([\u0600-\u06FFa-zA-Z])/g, '$1 $2')
    // Put spaces around units
    .replace(/\s*(سم|متر|cm|mm|m)\b/gi, ' $1')
    .replace(/\s+/g, ' ')
    .trim();

  // Check if string has multipliers (×, *, x)
  if (spaced.includes('×')) {
    const parts = spaced.split('×').map((p) => p.trim()).filter(Boolean);

    // Check if parts have descriptive words (e.g. "العرض 220 سم", "Width 220 cm")
    const hasLabels = parts.some((p) => /[\u0600-\u06FFa-zA-Z]{3,}/.test(p));

    if (hasLabels) {
      return (
        <div className={styles.labeledDimsGrid}>
          {parts.map((part, idx) => (
            <span key={idx} className={styles.dimChunk}>
              <bdi>{part}</bdi>
              {idx < parts.length - 1 && <span className={styles.dimSep}>×</span>}
            </span>
          ))}
        </div>
      );
    }

    // Otherwise it's pure numeric dimensions (e.g. "220 × 40 × 180 سم" or "200 × 160")
    // Extract trailing unit if any
    const unitMatch = spaced.match(/(?:سم|متر|cm|mm|m)\s*$/i);
    const unit = unitMatch ? unitMatch[0].trim() : '';
    const numericOnly = parts
      .map((p) => p.replace(/(?:سم|متر|cm|mm|m)/gi, '').trim())
      .join(' × ');

    return (
      <div className={styles.numericDimsWrapper}>
        <bdi dir="ltr" className={styles.dimensionNumbers}>
          {numericOnly}
        </bdi>
        {unit && (
          <span className={styles.unitLabel}>
            <bdi>{unit}</bdi>
          </span>
        )}
      </div>
    );
  }

  // Single number + measurement unit (e.g. "200 سم", "180 cm")
  const singleMeasureRegex = /^([\d\.]+)\s*(.*)$/;
  const singleMatch = spaced.match(singleMeasureRegex);
  if (singleMatch && singleMatch[2]) {
    return (
      <div className={styles.numericDimsWrapper}>
        <bdi dir="ltr" className={styles.dimensionNumbers}>
          {singleMatch[1]}
        </bdi>
        <span className={styles.unitLabel}>
          <bdi>{singleMatch[2].trim()}</bdi>
        </span>
      </div>
    );
  }

  // Text fallback (e.g. "Standard", "كبير", "Large")
  return (
    <div className={styles.sizeText}>
      <bdi>{spaced}</bdi>
    </div>
  );
};

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || '0', 10);
  const navigate = useNavigate();

  const { t, language, direction } = useLanguageStore();
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated, user } = useAuthStore();
  const { success, error: toastError } = useToast();

  const isRtl = direction === 'rtl';

  // Live SignalR Viewer Counter
  const { viewersCount } = useSignalRViewer(productId);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductOverview[]>([]);
  const [reviewsData, setReviewsData] = useState<ReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Selection state
  const [selectedColor, setSelectedColor] = useState<ColorDto | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isFavorited = isInWishlist(productId);

  useEffect(() => {
    if (!productId) return;

    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        const [prod, related, reviews] = await Promise.all([
          productService.getProductById(productId),
          productService.getRelatedProducts(productId).catch(() => []),
          reviewService.getProductReviews(productId).catch(() => null),
        ]);

        if (prod) {
          setProduct(prod);
          // Set initial color and variant
          if (prod.colors && prod.colors.length > 0) {
            setSelectedColor(prod.colors[0]);
          }
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }
        }
        setRelatedProducts(related);
        setReviewsData(reviews);
      } catch (err) {
        toastError(t('noProductsFound'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId, language]);

  if (isLoading) {
    return (
      <div className={`container ${styles.loadingContainer}`}>
        <div className={styles.spinner} />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`container ${styles.notFoundContainer}`}>
        <h2>{t('noProductsFound')}</h2>
        <button className={styles.backBtn} onClick={() => navigate('/shop')}>
          {t('startShopping')}
        </button>
      </div>
    );
  }

  // Dynamic Price calculation based on selected variant
  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.priceAfterDiscount > 0
    ? product.priceAfterDiscount
    : product.price;

  const originalPrice = selectedVariant
    ? selectedVariant.priceBeforeDiscount || selectedVariant.price
    : product.price;

  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const imagesList = product.images && product.images.length > 0 ? product.images : [{ path: '' }];
  const currentImageUrl = imagesList[activeImageIndex]?.path || imagesList[0]?.path || '';

  const handleAddToCart = () => {
    const chosenColorId = selectedColor ? Number((selectedColor as any).colorId || (selectedColor as any).id) || 0 : 0;
    const chosenVariantId = selectedVariant ? Number(selectedVariant.id) || 0 : 0;

    addItem({
      productId: Number(product.id),
      variantId: chosenVariantId,
      productName: product.name,
      type: selectedVariant?.type || '',
      size: selectedVariant?.size || '',
      color: selectedColor?.colorName || '',
      colorId: chosenColorId,
      englishColor: (selectedColor as any)?.englishColor || selectedColor?.colorName || '',
      unitPrice: currentPrice,
      originalPrice: originalPrice,
      imageUrl: currentImageUrl,
      quantity,
    });
    success(t('addedToCart'));
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      success(language === 'ar' ? 'تم نسخ رابط المنتج إلى الحافظة' : 'Product link copied to clipboard');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toastError(language === 'ar' ? 'يجب تسجيل الدخول لإضافة تقييم' : 'Please sign in to submit a review');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await reviewService.createReview({
        productId: product.id,
        rating: newRating,
        comment: newComment.trim(),
      });
      success(language === 'ar' ? 'تمت إضافة تقييمك بنجاح' : 'Review submitted successfully');
      setNewComment('');
      // Re-fetch reviews
      const updatedReviews = await reviewService.getProductReviews(product.id);
      setReviewsData(updatedReviews);
    } catch {
      toastError(language === 'ar' ? 'فشل في إرسال التقييم' : 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await reviewService.deleteReview(reviewId);
      success(language === 'ar' ? 'تم حذف التقييم' : 'Review deleted');
      // Re-fetch reviews
      const updatedReviews = await reviewService.getProductReviews(product.id);
      setReviewsData(updatedReviews);
    } catch {
      toastError(language === 'ar' ? 'فشل في حذف التقييم' : 'Failed to delete review');
    }
  };

  return (
    <div className={`container ${styles.detailsPage}`}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">{t('home')}</Link>
        <span className={styles.breadcrumbSep}>{isRtl ? '/' : '/'}</span>
        <Link to="/shop">{t('shop')}</Link>
        <span className={styles.breadcrumbSep}>{isRtl ? '/' : '/'}</span>
        <Link to={`/shop?category=${encodeURIComponent(product.cateogryValue || (product as any).categoryValue || '')}`}>
          {product.category || product.cateogryValue || (product as any).categoryValue || ''}
        </Link>
        <span className={styles.breadcrumbSep}>{isRtl ? '/' : '/'}</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className={styles.showcaseGrid}>
        {/* Left / Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrapper}>
            <img
              src={getImageUrl(currentImageUrl)}
              alt={product.name}
              className={styles.mainImage}
            />

            {hasDiscount && (
              <div className={styles.discountTag}>
                <span>-{discountPercent}%</span>
              </div>
            )}

            {/* Live Social Proof Badge */}
            {viewersCount > 0 && (
              <div className={styles.liveViewersBadge}>
                <span className={styles.liveDot} />
                <Users size={14} />
                <span>{t('liveViewers', { count: viewersCount })}</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {imagesList.length > 1 && (
            <div className={styles.thumbnails}>
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  className={`${styles.thumbBtn} ${idx === activeImageIndex ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={getImageUrl(img.path)} alt={`${product.name} thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right / Product Info & Actions */}
        <div className={styles.infoCol}>
          <div className={styles.infoCategory}>
            <span className={styles.categoryBadge}>{product.category}</span>
            <button className={styles.shareBtn} onClick={handleShare} title="Share product">
              <Share2 size={18} />
            </button>
          </div>

          <h1 className={styles.productTitle}>{product.name}</h1>

          {/* SKU & Star Rating */}
          <div className={styles.metaRow}>
            <div className={styles.ratingBox}>
              <StarRating rating={product.averageRate || 5} size={16} />
              <span className={styles.ratingVal}>
                {Number(product.averageRate || 5).toFixed(1)}
              </span>
              <span className={styles.reviewsCount}>
                ({reviewsData?.totalReviews || 0} {t('customerReviews')})
              </span>
            </div>

            {product.sku && (
              <div className={styles.skuTag}>
                <span>{t('sku')} {product.sku}</span>
              </div>
            )}
          </div>

          {/* Price Box */}
          <div className={styles.priceBox}>
            <div className={styles.priceMain}>
              <span className={styles.priceCurrent}>
                {currentPrice.toLocaleString()} {t('currency')}
              </span>
              {hasDiscount && (
                <span className={styles.priceOriginal}>
                  {originalPrice.toLocaleString()} {t('currency')}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className={styles.savingsTag}>
                {t('save')} {(originalPrice - currentPrice).toLocaleString()} {t('currency')}
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className={styles.shortDesc}>{product.shortDescription}</p>
          )}

          <div className={styles.divider} />

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>{t('selectColor')}</label>
              <div className={styles.colorSwatches}>
                {product.colors.map((color) => {
                  const isSelected = selectedColor?.colorId === color.colorId;
                  return (
                    <button
                      key={color.colorId}
                      className={`${styles.colorChip} ${isSelected ? styles.chipActive : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {isSelected && <Check size={14} className={styles.chipCheck} />}
                      <span>{color.colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Variant Size / Type Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>{t('selectSize')}</label>
              <div className={styles.variantGrid}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`${styles.variantCard} ${isSelected ? styles.variantActive : ''}`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      <div className={styles.variantInfo}>
                        <div className={styles.variantSizeRow}>
                          {renderVariantSize(v.size)}
                        </div>

                        {v.type && (
                          <span className={styles.variantType}>
                            <bdi>{v.type}</bdi>
                          </span>
                        )}

                        <span className={styles.variantPrice}>
                          <bdi>{v.price.toLocaleString()} {t('currency')}</bdi>
                        </span>
                      </div>

                      <div className={styles.checkIndicator}>
                        {isSelected && <Check size={16} className={styles.variantCheck} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className={styles.purchaseControls}>
            <div className={styles.qtyContainer}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button className={styles.addToCartBtn} onClick={handleAddToCart}>
              <ShoppingBag size={20} />
              <span>{t('addToCart')}</span>
            </button>

            <button
              className={`${styles.wishlistToggleBtn} ${isFavorited ? styles.wishlistActive : ''}`}
              onClick={() => toggleWishlist(product.id)}
              aria-label="Toggle Wishlist"
            >
              <Heart size={20} className={isFavorited ? styles.heartFilled : ''} />
            </button>
          </div>

          <button className={styles.buyNowBtn} onClick={handleBuyNow}>
            {t('buyNow')}
          </button>

          {/* Trust Value Badges */}
          <div className={styles.trustBadges}>
            <div className={styles.trustItem}>
              <Truck size={20} />
              <span>{language === 'ar' ? 'توصيل سريع وآمن لجميع المناطق' : 'Express White-Glove Delivery'}</span>
            </div>
            <div className={styles.trustItem}>
              <ShieldCheck size={20} />
              <span>{language === 'ar' ? 'ضمان جودة الأخشاب والخامات لمدة 5 سنوات' : '5-Year Structural Integrity Warranty'}</span>
            </div>
            <div className={styles.trustItem}>
              <RotateCcw size={20} />
              <span>{language === 'ar' ? 'إمكانية الاسترجاع والاستبدال خلال 14 يوماً' : '14-Day Seamless Return Policy'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Specifications & Customer Reviews */}
      <div className={styles.tabsSection}>
        <div className={styles.tabsHeader}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'specs' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            {t('specifications')}
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            {t('customerReviews')} ({reviewsData?.totalReviews || 0})
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'specs' && (
            <div className={styles.specsTab}>
              <h3 className={styles.specsTitle}>{language === 'ar' ? 'تفاصيل ومواصفات المنتج' : 'Product Specifications'}</h3>
              {product.descriptions && product.descriptions.length > 0 ? (
                <ul className={styles.specsList}>
                  {product.descriptions.map((desc, idx) => (
                    <li key={idx} className={styles.specItem}>
                      <Check size={18} className={styles.specIcon} />
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noSpecsText}>
                  {language === 'ar'
                    ? 'أثاث مصنوع من أجود خامات الخشب الطبيعي المقاوم للأحمال مع تشطيب فاخر ومريح.'
                    : 'Crafted with premium solid natural wood, reinforced structural joinery, and durable upholstery.'}
                </p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className={styles.reviewsTab}>
              {/* Reviews Summary */}
              <div className={styles.reviewsSummaryCard}>
                <div className={styles.avgRatingBox}>
                  <span className={styles.avgScore}>
                    {Number(reviewsData?.averageRating || product.averageRate || 5).toFixed(1)}
                  </span>
                  <StarRating rating={reviewsData?.averageRating || product.averageRate || 5} size={20} />
                  <span className={styles.totalReviewsLabel}>
                    {reviewsData?.totalReviews || 0} {t('customerReviews')}
                  </span>
                </div>
              </div>

              {/* Add Review Form */}
              <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
                <h4 className={styles.reviewFormTitle}>{t('writeReview')}</h4>

                <div className={styles.ratingPicker}>
                  <label>{t('rating')}</label>
                  <StarRating
                    rating={newRating}
                    interactive
                    size={24}
                    onChange={(val) => setNewRating(val)}
                  />
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('yourComment')}
                  className={styles.commentInput}
                  rows={3}
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmittingReview || !newComment.trim()}
                  className={styles.submitReviewBtn}
                >
                  <MessageSquare size={16} />
                  <span>{isSubmittingReview ? t('loading') : t('submitReview')}</span>
                </button>
              </form>

              {/* Reviews List */}
              <div className={styles.reviewsList}>
                {reviewsData?.singleReviews && reviewsData.singleReviews.length > 0 ? (
                  reviewsData.singleReviews.map((rev) => (
                    <div key={rev.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewAuthor}>
                          <div className={styles.authorAvatar}>
                            {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className={styles.authorName}>{rev.userName || 'Customer'}</span>
                            <div className={styles.reviewRating}>
                              <StarRating rating={rev.rate ?? rev.rating ?? 5} size={14} />
                            </div>
                          </div>
                        </div>

                        {rev.isUserCanDelete && (
                          <button
                            className={styles.deleteReviewBtn}
                            onClick={() => handleDeleteReview(rev.id)}
                            title={t('deleteReview')}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <p className={styles.reviewComment}>{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className={styles.noReviewsText}>{t('noReviewsYet')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Recommendation Carousel */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>{t('relatedProducts')}</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
