import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ExternalLink, Search, Eye } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { reviewService } from '@/services/reviewService';
import { SingleReview } from '@/types';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { StarRating } from '@/components/common/StarRating';
import { getErrorMessage } from '@/services/api';
import styles from './AdminReviewsPage.module.css';

export const AdminReviewsPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const { success, error: toastError } = useToast();

  const [reviews, setReviews] = useState<SingleReview[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllReviews();
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [language]);

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('confirmDeleteText'))) return;
    try {
      await reviewService.deleteReview(id);
      success(language === 'ar' ? 'تم حذف التقييم بنجاح' : 'Review deleted');
      fetchReviews();
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل حذف التقييم' : 'Failed to delete review'));
    }
  };

  const filteredReviews = reviews.filter((rev) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = (rev.userName || '').toLowerCase().includes(term);
    const emailMatch = (rev.email || '').toLowerCase().includes(term);
    const phoneMatch = (rev.phoneNumber || '').includes(term);
    const commentMatch = (rev.comment || '').toLowerCase().includes(term);
    const prodMatch = (rev.productName || '').toLowerCase().includes(term);
    const idMatch = String(rev.productId || '').includes(term);
    return nameMatch || emailMatch || phoneMatch || commentMatch || prodMatch || idMatch;
  });

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>{t('adminReviews')}</h1>
          <p className={styles.subtitle}>
            {language === 'ar'
              ? `إجمالي ${reviews.length} تقييمات مسجلة من قبل العملاء`
              : `${reviews.length} total customer reviews and feedback`}
          </p>
        </div>

        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالعميل أو المنتج أو التعليق...' : 'Search by user, product, or comment...'}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>{language === 'ar' ? 'العميل' : 'Customer'}</th>
                <th>{language === 'ar' ? 'المنتج' : 'Product'}</th>
                <th>{language === 'ar' ? 'التقييم' : 'Rating'}</th>
                <th>{language === 'ar' ? 'التعليق' : 'Comment'}</th>
                <th>{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((rev) => {
                const ratingValue = rev.rate ?? rev.rating ?? 5;
                const targetProductId = rev.productId;

                return (
                  <tr key={rev.id}>
                    <td>
                      <strong>#{rev.id}</strong>
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>
                          {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className={styles.userName}>{rev.userName || 'Customer'}</div>
                          <div className={styles.userMeta}>
                            {rev.email && <span>{rev.email}</span>}
                            {rev.phoneNumber && <span>{rev.phoneNumber}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.productCell}>
                        {targetProductId ? (
                          <>
                            <Link
                              to={`/product/${targetProductId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.productLink}
                              title={language === 'ar' ? 'انقر لفتح صفحة المنتج' : 'Click to view product page'}
                            >
                              <span>{rev.productName || (language === 'ar' ? `منتج #${targetProductId}` : `Product #${targetProductId}`)}</span>
                              <ExternalLink size={13} />
                            </Link>
                            <span className={styles.productIdBadge}>ID: #{targetProductId}</span>
                          </>
                        ) : (
                          <span>{rev.productName || '-'}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.ratingCell}>
                        <StarRating rating={ratingValue} size={15} />
                        <span className={styles.ratingValue}>{ratingValue}/5</span>
                      </div>
                    </td>
                    <td>
                      <p className={styles.commentText}>{rev.comment}</p>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        {rev.reviewDate ? rev.reviewDate.slice(0, 10) : rev.createdAt?.slice(0, 10) || '-'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        {targetProductId && (
                          <Link
                            to={`/product/${targetProductId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewProductBtn}
                            title={language === 'ar' ? 'عرض المنتج' : 'View Product'}
                          >
                            <Eye size={15} />
                          </Link>
                        )}
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(rev.id)}
                          title={t('deleteReview')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredReviews.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>
                    {t('noReviewsYet')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
