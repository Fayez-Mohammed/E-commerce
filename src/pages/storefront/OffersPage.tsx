import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Timer,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Truck,
  Award,
  Tag,
  Percent,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { offerService } from '@/services/offerService';
import { OfferItem } from '@/types';
import { getImageUrl } from '@/services/api';
import styles from './OffersPage.module.css';

export const OffersPage: React.FC = () => {
  const { t, language, direction } = useLanguageStore();
  const isRtl = direction === 'rtl';

  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Countdown state for spotlight offer
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    offerService
      .getOffers()
      .then((data) => {
        if (isMounted) {
          setOffers(data || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setOffers([]);
          setIsLoading(false);
        }
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [language]);

  // Spotlight active offer
  const spotlightOffer = offers[0] || null;
  const otherOffers = offers.length > 1 ? offers.slice(1) : [];

  // Countdown Timer Logic
  useEffect(() => {
    if (!spotlightOffer) return;

    const calculateTimeLeft = () => {
      let targetDate: Date;

      if (spotlightOffer.endDate) {
        targetDate = new Date(spotlightOffer.endDate);
      } else {
        // Fallback target: 3 days from now
        const now = new Date();
        targetDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      }

      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    timerRef.current = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [spotlightOffer]);

  return (
    <div className={styles.page}>
      {/* Hero Header Banner */}
      <section className={styles.heroBanner}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>{language === 'ar' ? 'تخفيضات موسمية حصرية' : 'Exclusive Seasonal Promotions'}</span>
          </div>
          <h1 className={styles.heroTitle}>{t('offers')}</h1>
          <p className={styles.heroSubtitle}>
            {language === 'ar'
              ? 'اكتشف أفضل الخصومات المتاحة لفترة محدودة على أفخم تصاميم الأثاث الخشبي والمودرن لمنزلك.'
              : 'Discover limited-time promotional pricing on premium solid wood and modern designer furniture.'}
          </p>
        </div>
      </section>

      <div className="container">
        {/* Spotlight Showcase */}
        {isLoading ? (
          <div className={styles.skeletonSpotlight} />
        ) : spotlightOffer ? (
          <section className={styles.spotlightSection}>
            <div className={styles.spotlightCard}>
              <div className={styles.spotlightImageWrapper}>
                <img
                  src={getImageUrl(spotlightOffer.imageUrl)}
                  alt={spotlightOffer.name}
                  className={styles.spotlightImage}
                />
                <div className={styles.spotlightBadge}>
                  <Percent size={14} />
                  <span>{language === 'ar' ? 'عرض رئيسي مميز' : 'Featured Spotlight'}</span>
                </div>
              </div>

              <div className={styles.spotlightDetails}>
                {(spotlightOffer.categoryAR || spotlightOffer.categoryEN || spotlightOffer.categoryValue) && (
                  <span className={styles.categoryTag}>
                    {language === 'ar'
                      ? spotlightOffer.categoryAR || spotlightOffer.categoryValue
                      : spotlightOffer.categoryEN || spotlightOffer.categoryValue}
                  </span>
                )}

                <h2 className={styles.spotlightTitle}>{spotlightOffer.name}</h2>
                <p className={styles.spotlightDescription}>{spotlightOffer.description}</p>

                {/* Countdown Box */}
                <div className={styles.countdownContainer}>
                  <div className={styles.countdownHeader}>
                    <Timer size={16} />
                    <span>{language === 'ar' ? 'ينتهي هذا العرض الحصري خلال:' : 'Offer expires in:'}</span>
                  </div>

                  <div className={styles.countdownBoxes}>
                    <div className={styles.timeBox}>
                      <span className={styles.timeNum}>
                        {String(timeLeft.days).padStart(2, '0')}
                      </span>
                      <span className={styles.timeLabel}>{t('days')}</span>
                    </div>
                    <div className={styles.timeBox}>
                      <span className={styles.timeNum}>
                        {String(timeLeft.hours).padStart(2, '0')}
                      </span>
                      <span className={styles.timeLabel}>{t('hours')}</span>
                    </div>
                    <div className={styles.timeBox}>
                      <span className={styles.timeNum}>
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </span>
                      <span className={styles.timeLabel}>{t('minutes')}</span>
                    </div>
                    <div className={styles.timeBox}>
                      <span className={styles.timeNum}>
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                      <span className={styles.timeLabel}>{t('seconds')}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={
                    spotlightOffer.categoryValue
                      ? `/shop?category=${encodeURIComponent(spotlightOffer.categoryValue)}`
                      : '/shop'
                  }
                  className={styles.claimOfferBtn}
                >
                  <ShoppingBag size={18} />
                  <span>{language === 'ar' ? 'تسوق هذا العرض الآن' : 'Shop This Offer Now'}</span>
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {/* Other Active Offers Grid */}
        {otherOffers.length > 0 && (
          <section className={styles.gridSection}>
            <div className={styles.sectionHeading}>
              <h3 className={styles.sectionTitle}>
                {language === 'ar' ? 'عروض وتخفيضات أخرى متاحة' : 'More Active Promotions'}
              </h3>
              <span className={styles.offersCount}>
                {otherOffers.length} {language === 'ar' ? 'عروض إضافية' : 'additional offers'}
              </span>
            </div>

            <div className={styles.offersGrid}>
              {otherOffers.map((offer) => (
                <div key={offer.id} className={styles.offerCard}>
                  <div className={styles.cardImageWrapper}>
                    <img
                      src={getImageUrl(offer.imageUrl)}
                      alt={offer.name}
                      loading="lazy"
                      className={styles.cardImage}
                    />
                    <span className={styles.cardFloatingBadge}>
                      <Tag size={12} style={{ display: 'inline', marginInlineEnd: 4 }} />
                      {language === 'ar' ? 'عرض خاص' : 'Special Deal'}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    {(offer.categoryAR || offer.categoryEN || offer.categoryValue) && (
                      <span className={styles.cardCategory}>
                        {language === 'ar'
                          ? offer.categoryAR || offer.categoryValue
                          : offer.categoryEN || offer.categoryValue}
                      </span>
                    )}

                    <h4 className={styles.cardTitle}>{offer.name}</h4>
                    <p className={styles.cardDescription}>{offer.description}</p>

                    <div className={styles.cardFooter}>
                      <div className={styles.validityDate}>
                        <Calendar size={13} />
                        <span>
                          {offer.endDate
                            ? `${language === 'ar' ? 'حتى' : 'Until'} ${offer.endDate.slice(0, 10)}`
                            : language === 'ar'
                            ? 'لفترة محدودة'
                            : 'Limited time'}
                        </span>
                      </div>

                      <Link
                        to={
                          offer.categoryValue
                            ? `/shop?category=${encodeURIComponent(offer.categoryValue)}`
                            : '/shop'
                        }
                        className={styles.cardCtaLink}
                      >
                        <span>{language === 'ar' ? 'تسوق' : 'Shop'}</span>
                        {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLoading && offers.length === 0 && (
          <div className={styles.emptySection}>
            <div className={styles.emptyIconBox}>
              <Sparkles size={28} />
            </div>
            <h3 className={styles.emptyTitle}>
              {language === 'ar' ? 'لا توجد عروض ترويجية نشطة حالياً' : 'No Active Offers Right Now'}
            </h3>
            <p className={styles.emptySubtitle}>
              {language === 'ar'
                ? 'تابعنا باستمرار للاستفادة من أحدث الخصومات والتخفيضات القادمة، أو استمتع بتصفح منتجاتنا في المتجر.'
                : 'Stay tuned for upcoming promotions, or explore our full collection in the shop.'}
            </p>
            <Link to="/shop" className={styles.emptyCta}>
              <span>{t('startShopping')}</span>
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </div>
        )}

        {/* Value Assurance Badges */}
        <section className={styles.valuesSection}>
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <div className={styles.valueIconBox}>
                <Award size={24} />
              </div>
              <h4 className={styles.valueTitle}>
                {language === 'ar' ? 'ضمان شامل 5 سنوات' : '5-Year Structural Warranty'}
              </h4>
              <p className={styles.valueSubtitle}>
                {language === 'ar'
                  ? 'جميع منتجاتنا مصنعة بأعلى مواصفات أخشاب الزان الطبيعي مع ضمان كامل.'
                  : 'Engineered with natural solid beechwood with comprehensive warranty.'}
              </p>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIconBox}>
                <Truck size={24} />
              </div>
              <h4 className={styles.valueTitle}>
                {language === 'ar' ? 'توصيل وتركيب موثوق' : 'White-Glove Delivery'}
              </h4>
              <p className={styles.valueSubtitle}>
                {language === 'ar'
                  ? 'خدمة شحن سريعة وفنيون متخصصون لتركيب الأثاث في منزلك باحترافية.'
                  : 'Fast dispatch and professional installation directly in your home.'}
              </p>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIconBox}>
                <ShieldCheck size={24} />
              </div>
              <h4 className={styles.valueTitle}>
                {language === 'ar' ? 'معاينة قبل الاستلام' : 'Inspect Before Pay'}
              </h4>
              <p className={styles.valueSubtitle}>
                {language === 'ar'
                  ? 'حق المعاينة والفحص الكامل للمنتج عند الاستلام لضمان رضاك التام.'
                  : 'Full right to inspect and verify your pieces upon arrival.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
