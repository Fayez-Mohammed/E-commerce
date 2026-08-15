import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, Search, Sparkles } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { ProductOverview, CategoryItem, PagedResult } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Pagination } from '@/components/common/Pagination';
import { ProductCardSkeleton } from '@/components/common/SkeletonLoader';
import styles from './ShopPage.module.css';

export const ShopPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query state
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentOrder = searchParams.get('order') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [pagedResult, setPagedResult] = useState<PagedResult<ProductOverview>>({
    data: [],
    totalPages: 1,
    currentPage: 1,
    categoryName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Fetch categories once
  useEffect(() => {
    categoryService
      .getCategories()
      .then((data) => setCategories(data))
      .catch(() => {});
  }, [language]);

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch Products on query parameter changes
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await productService.getProducts({
          category: currentCategory || undefined,
          search: currentSearch || undefined,
          order: currentOrder || undefined,
          page: currentPage,
          pageSize: 12,
          LanguageCode: language,
        });
        setPagedResult(res);
      } catch {
        setPagedResult({ data: [], totalPages: 1, currentPage: 1, categoryName: '' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentCategory, currentSearch, currentOrder, currentPage, language]);

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(page));
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim() || null);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(currentCategory || currentSearch || currentOrder);

  const activeCategoryName = useMemo(() => {
    if (!currentCategory) return t('allCategories');
    const found = categories.find((c) => c.categoryValue.toLowerCase() === currentCategory.toLowerCase());
    return found ? found.category : currentCategory;
  }, [currentCategory, categories, t]);

  return (
    <div className={`container ${styles.shopPage}`}>
      {/* Header Banner */}
      <div className={styles.shopHeader}>
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>{activeCategoryName}</h1>
          <p className={styles.pageSubtitle}>
            {language === 'ar'
              ? 'تصفح أحدث تصاميم الأثاث والديكور العصري المختارة بعناية لمنزلك'
              : 'Discover architecturally inspired furniture and luxury statement pieces'}
          </p>
        </div>

        {/* Search inside shop */}
        <form className={styles.shopSearchForm} onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={styles.shopSearchInput}
          />
          <button type="submit" className={styles.shopSearchBtn} aria-label="Search">
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* Action Bar (Filters trigger & Sorting) */}
      <div className={styles.actionBar}>
        <div className={styles.actionLeft}>
          <button className={styles.mobileFilterBtn} onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}>
            <SlidersHorizontal size={18} />
            <span>{t('filterBy')}</span>
          </button>

          <span className={styles.resultsCount}>
            {t('resultsCount', { count: pagedResult.data.length })}
          </span>
        </div>

        <div className={styles.actionRight}>
          <label htmlFor="sort-select" className={styles.sortLabel}>
            {t('sortBy')}:
          </label>
          <select
            id="sort-select"
            value={currentOrder}
            onChange={(e) => updateParam('order', e.target.value || null)}
            className={styles.sortSelect}
          >
            <option value="">{t('sortDefault')}</option>
            <option value="latest_desc">{t('sortLatest')}</option>
            <option value="price_asc">{t('sortPriceAsc')}</option>
            <option value="price_desc">{t('sortPriceDesc')}</option>
            <option value="rating_desc">{t('sortRatingDesc')}</option>
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className={styles.activeFilters}>
          {currentCategory && (
            <span className={styles.filterTag}>
              <span>{activeCategoryName}</span>
              <button onClick={() => updateParam('category', null)} aria-label="Remove category filter">
                <X size={14} />
              </button>
            </span>
          )}

          {currentSearch && (
            <span className={styles.filterTag}>
              <span>"{currentSearch}"</span>
              <button onClick={() => updateParam('search', null)} aria-label="Remove search filter">
                <X size={14} />
              </button>
            </span>
          )}

          {currentOrder && (
            <span className={styles.filterTag}>
              <span>{t(currentOrder === 'price_asc' ? 'sortPriceAsc' : currentOrder === 'price_desc' ? 'sortPriceDesc' : currentOrder === 'rating_desc' ? 'sortRatingDesc' : 'sortLatest')}</span>
              <button onClick={() => updateParam('order', null)} aria-label="Remove sort filter">
                <X size={14} />
              </button>
            </span>
          )}

          <button className={styles.clearAllBtn} onClick={clearAllFilters}>
            {t('clearFilters')}
          </button>
        </div>
      )}

      {/* Main Layout Grid (Sidebar + Products) */}
      <div className={styles.mainLayout}>
        {/* Mobile Backdrop */}
        {isMobileFilterOpen && (
          <div className={styles.sidebarBackdrop} onClick={() => setIsMobileFilterOpen(false)} />
        )}

        {/* Sidebar Categories */}
        <aside className={`${styles.sidebar} ${isMobileFilterOpen ? styles.mobileOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>
              <Filter size={18} />
              <h3>{t('filterBy')}</h3>
            </div>
            {isMobileFilterOpen && (
              <button className={styles.closeSidebarBtn} onClick={() => setIsMobileFilterOpen(false)}>
                <X size={20} />
              </button>
            )}
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterGroupTitle}>{t('categories')}</h4>
            <div className={styles.categoryList}>
              <button
                className={`${styles.categoryOption} ${!currentCategory ? styles.active : ''}`}
                onClick={() => {
                  updateParam('category', null);
                  setIsMobileFilterOpen(false);
                }}
              >
                <span>{t('allCategories')}</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.categoryValue}
                  className={`${styles.categoryOption} ${
                    currentCategory.toLowerCase() === cat.categoryValue.toLowerCase() ? styles.active : ''
                  }`}
                  onClick={() => {
                    updateParam('category', cat.categoryValue);
                    setIsMobileFilterOpen(false);
                  }}
                >
                  <span>{cat.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Value Prop Badge in sidebar */}
          <div className={styles.sidebarPromo}>
            <Sparkles size={20} className={styles.promoIcon} />
            <p className={styles.promoText}>
              {language === 'ar'
                ? 'جميع منتجاتنا مصنعة من أخشاب معالجة ومحمية ضد الرطوبة وعوامل التآكل.'
                : 'All furniture is crafted from sustainably harvested, kiln-dried hardwoods.'}
            </p>
          </div>
        </aside>

        {/* Products Content */}
        <div className={styles.productsArea}>
          {isLoading ? (
            <div className={styles.productsGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : pagedResult.data.length > 0 ? (
            <>
              <div className={styles.productsGrid}>
                {pagedResult.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={pagedResult.currentPage || currentPage}
                totalPages={pagedResult.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>
                <Search size={48} />
              </div>
              <h3>{t('noProductsFound')}</h3>
              <p>
                {language === 'ar'
                  ? 'جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً من القائمة الجانبية.'
                  : 'Try adjusting your search criteria or resetting filters.'}
              </p>
              <button className={styles.resetBtn} onClick={clearAllFilters}>
                {t('clearFilters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
