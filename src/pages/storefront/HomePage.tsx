import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Timer,
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { offerService } from '@/services/offerService';
import { ProductOverview, CategoryItem, OfferItem } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/common/SkeletonLoader';
import { getImageUrl } from '@/services/api';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const { t, language, direction } = useLanguageStore();
  const navigate = useNavigate();
  const isRtl = direction === 'rtl';

  const [recentProducts, setRecentProducts] = useState<ProductOverview[]>([]);
  const [ratedProducts, setRatedProducts] = useState<ProductOverview[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [offersList, setOffersList] = useState<OfferItem[]>([]);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfferPaused, setIsOfferPaused] = useState(false);

  // Offer Countdown state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [recent, rated, cats, offers] = await Promise.all([
          productService.getTopRecentProducts().catch(() => []),
          productService.getTopRatedProducts().catch(() => []),
          categoryService.getCategories().catch(() => []),
          offerService.getOffers().catch(() => []),
        ]);

        if (isMounted) {
          setRecentProducts(recent);
          setRatedProducts(rated);
          setCategories(cats);
          setOffersList(offers);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [language]);

  const currentOffer = offersList[activeOfferIndex] || null;

  // Auto-advance offers smoothly without causing page flicker
  useEffect(() => {
    if (offersList.length <= 1 || isOfferPaused) return;

    const interval = setInterval(() => {
      setActiveOfferIndex((prev) => (prev + 1) % offersList.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [offersList.length, isOfferPaused]);

  // Smooth Countdown timer calculation
  useEffect(() => {
    const endDateStr = currentOffer?.endDate;
    if (!endDateStr) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const calculateTime = () => {
      const end = new Date(endDateStr).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(calculateTime, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentOffer?.endDate]);

  const handleNextOffer = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (offersList.length === 0) return;
    setActiveOfferIndex((prev) => (prev + 1) % offersList.length);
  }, [offersList.length]);

  const handlePrevOffer = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (offersList.length === 0) return;
    setActiveOfferIndex((prev) => (prev - 1 + offersList.length) % offersList.length);
  }, [offersList.length]);

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <Sparkles size={16} />
              <span>{language === 'ar' ? 'مجموعة 2026 للأثاث الحديث' : 'Exclusive 2026 Living Collection'}</span>
            </div>

            <h1 className={styles.heroHeading}>{t('heroTitle')}</h1>
            <p className={styles.heroParagraph}>{t('heroSubtitle')}</p>

            <div className={styles.heroCtas}>
              <Link to="/shop" className={styles.primaryCta}>
                <span>{t('shopNow')}</span>
                {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </Link>
              <Link to="/shop?category=living-room" className={styles.secondaryCta}>
                <span>{t('exploreCategories')}</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className={styles.heroMetrics}>
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>+1,200</span>
                <span className={styles.metricLabel}>{language === 'ar' ? 'قطعة فاخرة' : 'Unique Pieces'}</span>
              </div>
              <div className={styles.metricDivider} />
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>100%</span>
                <span className={styles.metricLabel}>{language === 'ar' ? 'خشب طبيعي زان وبلوط' : 'Solid Natural Woods'}</span>
              </div>
              <div className={styles.metricDivider} />
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>5.0 ★</span>
                <span className={styles.metricLabel}>{language === 'ar' ? 'تقييم العملاء' : 'Customer Rating'}</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroImageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury Modern Living Furniture"
                className={styles.heroImage}
                loading="eager"
              />
              <div className={styles.floatingCard}>
                <Award size={24} className={styles.floatingCardIcon} />
                <div>
                  <p className={styles.floatingCardTitle}>{language === 'ar' ? 'ضمان 5 سنوات' : '5 Years Warranty'}</p>
                  <p className={styles.floatingCardSub}>{language === 'ar' ? 'أعلى معايير المتانة والجودة' : 'Premium craftsmanship'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Offers Showcase Slider (Zero-Flicker Cross-Fade Carousel) */}
      {offersList.length > 0 && (
        <section
          className={`container ${styles.offerSection}`}
          onMouseEnter={() => setIsOfferPaused(true)}
          onMouseLeave={() => setIsOfferPaused(false)}
        >
          <div className={styles.offerBanner}>
            <div className={styles.offerContent}>
              {/* Header tags & Slider Controls */}
              <div className={styles.offerTopRow}>
                <div className={styles.offerTag}>
                  <Timer size={16} />
                  <span>{t('specialOffer')}</span>
                </div>

                {offersList.length > 1 && (
                  <div className={styles.sliderControls}>
                    <button
                      type="button"
                      onClick={handlePrevOffer}
                      className={styles.sliderArrowBtn}
                      aria-label="Previous Offer"
                    >
                      {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                    <span className={styles.offerIndexIndicator}>
                      {activeOfferIndex + 1} / {offersList.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextOffer}
                      className={styles.sliderArrowBtn}
                      aria-label="Next Offer"
                    >
                      {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Offer Text Container */}
              <div className={styles.offerTextContainer}>
                {offersList.map((off, idx) => {
                  const isActive = idx === activeOfferIndex;
                  return (
                    <div
                      key={off.id || idx}
                      className={`${styles.offerSlideText} ${isActive ? styles.slideTextActive : ''}`}
                    >
                      <h2 className={styles.offerTitle}>
                        {language === 'ar' ? off.name : off.name || off.description}
                      </h2>
                      <p className={styles.offerDescription}>{off.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Countdown Clocks */}
              <div className={styles.countdownWrapper}>
                <div className={styles.countdownUnit}>
                  <span className={styles.countdownNumber}>{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className={styles.countdownLabel}>{t('days')}</span>
                </div>
                <span className={styles.countdownColon}>:</span>
                <div className={styles.countdownUnit}>
                  <span className={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className={styles.countdownLabel}>{t('hours')}</span>
                </div>
                <span className={styles.countdownColon}>:</span>
                <div className={styles.countdownUnit}>
                  <span className={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className={styles.countdownLabel}>{t('minutes')}</span>
                </div>
                <span className={styles.countdownColon}>:</span>
                <div className={styles.countdownUnit}>
                  <span className={styles.countdownNumber}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className={styles.countdownLabel}>{t('seconds')}</span>
                </div>
              </div>

              {/* Action Button & Offer Navigation Pills */}
              <div className={styles.offerActionsRow}>
                <Link
                  to={
                    currentOffer?.categoryValue
                      ? `/shop?category=${encodeURIComponent(currentOffer.categoryValue)}`
                      : '/shop'
                  }
                  className={styles.offerBtn}
                >
                  <ShoppingBag size={18} />
                  <span>{t('shopNow')}</span>
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </Link>

                {/* Offer Dots */}
                {offersList.length > 1 && (
                  <div className={styles.offerDots}>
                    {offersList.map((off, idx) => (
                      <button
                        key={off.id || idx}
                        type="button"
                        className={`${styles.offerDot} ${idx === activeOfferIndex ? styles.activeDot : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveOfferIndex(idx);
                        }}
                        title={off.name}
                        aria-label={`Go to offer ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stacked Images Preloaded with Cross-Fade Transition */}
            <div className={styles.offerImageContainer}>
              {offersList.map((off, idx) => (
                <img
                  key={off.id || idx}
                  src={getImageUrl(off.imageUrl)}
                  alt={off.name || 'Special Offer'}
                  loading="eager"
                  className={`${styles.offerImage} ${idx === activeOfferIndex ? styles.offerImageActive : ''}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Discovery Showcase */}
      {categories.length > 0 && (
        <section className={`container ${styles.categorySection}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>{t('exploreCategories')}</h2>
              <p className={styles.sectionSubtitle}>
                {language === 'ar' ? 'اختر القسم المناسب لمساحة منزلك' : 'Curated collections for every room'}
              </p>
            </div>
            <Link to="/shop" className={styles.viewAllLink}>
              <span>{t('viewAll')}</span>
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </div>

          <div className={styles.categoriesGrid}>
            {categories.map((cat) => (
              <Link
                key={cat.categoryValue}
                to={`/shop?category=${encodeURIComponent(cat.categoryValue)}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryImgWrapper}>
                  <img
                    src={getImageUrl(cat.categoryImage)}
                    alt={cat.category}
                    className={styles.categoryImg}
                    loading="lazy"
                  />
                  <div className={styles.categoryOverlay} />
                </div>
                <div className={styles.categoryCardContent}>
                  <h3 className={styles.categoryCardTitle}>{cat.category}</h3>
                  <span className={styles.exploreArrow}>
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      <section className={`container ${styles.productsSection}`}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>{t('newArrivals')}</h2>
            <p className={styles.sectionSubtitle}>{t('newArrivalsSubtitle')}</p>
          </div>
          <Link to="/shop?order=latest_desc" className={styles.viewAllLink}>
            <span>{t('viewAll')}</span>
            {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </Link>
        </div>

        <div className={styles.productsGrid}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : recentProducts.length > 0 ? (
            recentProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className={styles.emptyGridMessage}>
              <p>{t('noProductsFound')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Editorial Inspiration Banner */}
      <section className={`container ${styles.editorialSection}`}>
        <div className={styles.editorialCard}>
          <div className={styles.editorialImageWrapper}>
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
              alt="Artisan Craftsmanship"
              className={styles.editorialImage}
              loading="lazy"
            />
          </div>
          <div className={styles.editorialContent}>
            <span className={styles.editorialPretitle}>
              {language === 'ar' ? 'فلسفة التصميم' : 'DESIGN PHILOSOPHY'}
            </span>
            <h2 className={styles.editorialTitle}>
              {language === 'ar'
                ? 'تناغم المواد الطبيعية مع أحدث صيحات الديكور الحديث'
                : 'Natural textures meet architectural balance & quiet luxury'}
            </h2>
            <p className={styles.editorialText}>
              {language === 'ar'
                ? 'نؤمن أن الأثاث ليس مجرد قطع وظيفية، بل هو انعكاس لأسلوب حياتك. نصنع كل قطعة بأيدي أمهر الحرفيين ومن أجود أنواع الأخشاب الصلبة والأقمشة المقاومة للبقع.'
                : 'Every piece in our catalog is engineered for harmony and longevity, crafted from solid natural hardwoods and stain-resistant performance textiles.'}
            </p>
            <div className={styles.editorialPillars}>
              <div className={styles.pillar}>
                <ShieldCheck size={20} className={styles.pillarIcon} />
                <span>{language === 'ar' ? 'خشب زان وبلوط طبيعي' : 'Natural Solid Woods'}</span>
              </div>
              <div className={styles.pillar}>
                <Truck size={20} className={styles.pillarIcon} />
                <span>{language === 'ar' ? 'تركيب احترافي مجاني' : 'White-Glove Assembly'}</span>
              </div>
            </div>
            <button className={styles.editorialBtn} onClick={() => navigate('/shop')}>
              <ShoppingBag size={18} />
              <span>{t('shopNow')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Best Sellers / Top Rated Section */}
      <section className={`container ${styles.productsSection}`}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>{t('bestSellers')}</h2>
            <p className={styles.sectionSubtitle}>{t('bestSellersSubtitle')}</p>
          </div>
          <Link to="/shop?order=rating_desc" className={styles.viewAllLink}>
            <span>{t('viewAll')}</span>
            {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </Link>
        </div>

        <div className={styles.productsGrid}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : ratedProducts.length > 0 ? (
            ratedProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className={styles.emptyGridMessage}>
              <p>{t('noProductsFound')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
