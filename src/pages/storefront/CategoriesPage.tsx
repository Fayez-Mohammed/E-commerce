import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { categoryService } from '@/services/categoryService';
import { CategoryItem } from '@/types';
import { getImageUrl } from '@/services/api';
import styles from './CategoriesPage.module.css';

export const CategoriesPage: React.FC = () => {
  const { t, language, direction } = useLanguageStore();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isRtl = direction === 'rtl';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    categoryService
      .getCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCategories([]);
          setIsLoading(false);
        }
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [language]);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Page Header */}
        <div className={styles.headerSection}>
          <div className={styles.badge}>
            <Layers size={14} className={styles.badgeIcon} />
            <span>{language === 'ar' ? 'تشكيلات الأثاث الفاخر' : 'Premium Furniture Collections'}</span>
          </div>
          <h1 className={styles.title}>{t('categories')}</h1>
          <p className={styles.subtitle}>
            {language === 'ar'
              ? 'استكشف تشكيلاتنا المتنوعة من غرف النوم، المعيشة، السفرة، والمزيد المصممة بأعلى معايير الجودة والأناقة لتناسب ذوقك الرفيع.'
              : 'Explore our curated collections of bedrooms, living rooms, dining spaces, and outdoor furniture designed for modern living.'}
          </p>
        </div>

        {/* Categories Grid */}
        <div className={styles.grid}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className={styles.skeletonCard} />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.categoryValue}
                  to={`/shop?category=${encodeURIComponent(cat.categoryValue)}`}
                  className={styles.categoryCard}
                >
                  <div className={styles.imageWrapper}>
                    <img
                      src={getImageUrl(cat.categoryImage)}
                      alt={cat.category}
                      loading="lazy"
                      className={styles.categoryImage}
                    />
                    <div className={styles.gradientOverlay} />
                  </div>

                  <div className={styles.contentBox}>
                    <h3 className={styles.categoryName}>{cat.category}</h3>
                    <div className={styles.exploreAction}>
                      <span>{language === 'ar' ? 'تصفح المنتجات' : 'Explore Products'}</span>
                      {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
};
