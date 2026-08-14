import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, XCircle, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { Badge } from '@/components/common/Badge';
import styles from './OrdersPage.module.css';

export const OrdersPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { t, language, direction } = useLanguageStore();
  const navigate = useNavigate();
  const isRtl = direction === 'rtl';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
    }
  }, [isAuthenticated]);

  return (
    <div className={`container ${styles.ordersPage}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('myOrders')}</h1>
          <p className={styles.subtitle}>
            {language === 'ar'
              ? 'متابعة حالة طلباتك ومواعيد التوصيل المؤكدة'
              : 'Track your confirmed furniture orders and white-glove delivery timelines'}
          </p>
        </div>
      </div>

      <div className={styles.ordersContent}>
        <div className={styles.emptyCard}>
          <div className={styles.iconCircle}>
            <Package size={48} />
          </div>
          <h3>{language === 'ar' ? 'سجل طلباتك' : 'Your Orders Pipeline'}</h3>
          <p>
            {language === 'ar'
              ? 'عند إتمام طلبك، يقوم فريق خدمة العملاء بالتواصل معك مباشرة لتأكيد تفاصيل الشحن والتركيب.'
              : 'Whenever an order is confirmed, our concierge team coordinates with you directly for custom scheduling.'}
          </p>
          <button className={styles.shopBtn} onClick={() => navigate('/shop')}>
            <span>{t('startShopping')}</span>
            {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
