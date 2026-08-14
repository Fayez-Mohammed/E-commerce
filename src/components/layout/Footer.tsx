import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ShieldCheck, Truck, RefreshCw, Award, Heart } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { categoryService } from '@/services/categoryService';
import { CategoryItem } from '@/types';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const { t, language } = useLanguageStore();
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    categoryService
      .getCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data.slice(0, 6));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [language]);

  return (
    <footer className={styles.footer}>
      {/* Brand Value Pillars */}
      <div className={styles.featuresStrip}>
        <div className={`container ${styles.featuresGrid}`}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Truck size={24} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>{t('freeShippingTitle')}</h4>
              <p className={styles.featureDesc}>{t('freeShippingDesc')}</p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Award size={24} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>{t('qualityTitle')}</h4>
              <p className={styles.featureDesc}>{t('qualityDesc')}</p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>{t('securePaymentTitle')}</h4>
              <p className={styles.featureDesc}>{t('securePaymentDesc')}</p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>{t('supportTitle')}</h4>
              <p className={styles.featureDesc}>{t('supportDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className={`container ${styles.mainFooter}`}>
        <div className={styles.footerGrid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <span className={styles.logoLetter}>W</span>
              </div>
              <span className={styles.brandTitle}>WALLSSHOP</span>
            </div>
            <p className={styles.brandBio}>
              {language === 'ar'
                ? 'وجهتك الأولى للأثاث العصري، والتصاميم الراقية التي تحول كل زاوية في منزلك إلى تحفة فنية تعبر عن ذوقك الرفيع.'
                : 'Your premier destination for modern luxury furniture, curated statement pieces, and enduring architectural living spaces.'}
            </p>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>{language === 'ar' ? 'جمهورية مصر العربية - القاهرة' : 'Cairo, Egypt'}</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={16} />
                <a href="tel:01027016323" style={{ color: 'inherit' }}>01027016323</a>
              </div>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <a href="mailto:fayez00mohammed@gmail.com" style={{ color: 'inherit' }}>fayez00mohammed@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Dynamic Categories Links */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>{t('exploreCategories')}</h4>
            <ul className={styles.linksList}>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.categoryValue}>
                    <Link to={`/shop?category=${encodeURIComponent(cat.categoryValue)}`}>
                      {cat.category}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link to="/shop?category=Living-Room-&-TV-Units">
                      {language === 'ar' ? 'غرف المعيشة ووحدات التلفزيون' : 'Living Room & TV Units'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/shop?category=Bedroom-&-Dressing-Room">
                      {language === 'ar' ? 'غرف النوم والدريسنج روم' : 'Bedroom & Dressing Room'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/shop?category=Dining-Room">
                      {language === 'ar' ? 'غرف السفرة' : 'Dining Room'}
                    </Link>
                  </li>
                </>
              )}
              <li style={{ marginTop: '0.25rem' }}>
                <Link to="/categories" style={{ color: 'var(--color-accent-600)', fontWeight: 700 }}>
                  {language === 'ar' ? '← جميع الأقسام' : 'All Categories →'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>{language === 'ar' ? 'خدمة العملاء' : 'Customer Care'}</h4>
            <ul className={styles.linksList}>
              <li>
                <Link to="/contact">{t('contact')}</Link>
              </li>
              <li>
                <Link to="/orders">{t('myOrders')}</Link>
              </li>
              <li>
                <Link to="/wishlist">{t('wishlist')}</Link>
              </li>
              <li>
                <Link to="/profile">{t('profile')}</Link>
              </li>
              <li>
                <Link to="/offers">{t('offers')}</Link>
              </li>
              <li>
                <Link to="/shop">{t('shopNow')}</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Warranty */}
          <div className={styles.newsletterCol}>
            <h4 className={styles.colTitle}>{language === 'ar' ? 'النشرة البريدية' : 'Stay Connected'}</h4>
            <p className={styles.newsletterDesc}>
              {language === 'ar'
                ? 'اشترك للحصول على أحدث العروض والتشكيلات الحصرية فور نزولها.'
                : 'Subscribe to receive private invitations to seasonal collections and design updates.'}
            </p>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
                className={styles.newsletterInput}
              />
              <button className={styles.newsletterBtn}>
                {language === 'ar' ? 'اشتراك' : 'Join'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>{t('copyright')}</p>
          <p className={styles.madeWith}>
            Crafted with <Heart size={14} className={styles.heartIcon} /> for elegant spaces
          </p>
        </div>
      </div>
    </footer>
  );
};
