import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  PackageCheck,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { orderService } from '@/services/orderService';
import { getImageUrl, getErrorMessage } from '@/services/api';
import styles from './CheckoutPage.module.css';

export const CheckoutPage: React.FC = () => {
  const { items, summary, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { t, language, direction } = useLanguageStore();
  const { error: toastError } = useToast();
  const navigate = useNavigate();
  const isRtl = direction === 'rtl';

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    address: '',
    note: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toastError(language === 'ar' ? 'يجب تسجيل الدخول لإتمام الطلب' : 'Please sign in to place your order');
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!formData.fullName.trim() || !formData.phoneNumber.trim() || !formData.address.trim()) {
      toastError(language === 'ar' ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await orderService.makeOrder({
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        note: formData.note.trim() || undefined,
      });

      setCreatedOrderId(res.orderId);
      clearCart();

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'حدث خطأ أثناء إنشاء الطلب' : 'Failed to place order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Success Screen
  if (createdOrderId !== null) {
    return (
      <div className={`container ${styles.successContainer}`}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={64} />
          </div>

          <h1 className={styles.successTitle}>{t('orderSuccessTitle')}</h1>
          <p className={styles.successSubtitle}>
            {t('orderSuccessSubtitle', { id: createdOrderId })}
          </p>

          <div className={styles.successNoticeBox}>
            <Truck size={24} className={styles.noticeTruck} />
            <p>{t('orderSuccessNotice')}</p>
          </div>

          <div className={styles.successActions}>
            <Link to="/orders" className={styles.ordersBtn}>
              <PackageCheck size={18} />
              <span>{t('myOrders')}</span>
            </Link>

            <Link to="/" className={styles.homeBtn}>
              <span>{t('backToHome')}</span>
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart Check
  if (items.length === 0) {
    return (
      <div className={`container ${styles.emptyCartContainer}`}>
        <h2>{t('cartEmpty')}</h2>
        <p>{t('cartEmptySubtitle')}</p>
        <button className={styles.homeBtn} onClick={() => navigate('/shop')}>
          {t('startShopping')}
        </button>
      </div>
    );
  }

  return (
    <div className={`container ${styles.checkoutPage}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>{t('checkout')}</h1>
        <div className={styles.securityBadge}>
          <Lock size={16} />
          <span>{language === 'ar' ? 'اتصال مشفر وآمن 256-bit' : 'Encrypted & Secure Checkout'}</span>
        </div>
      </div>

      {!isAuthenticated && (
        <div className={styles.authNoticeBanner}>
          <div className={styles.authNoticeLeft}>
            <AlertCircle size={22} className={styles.noticeAlertIcon} />
            <div>
              <p className={styles.authNoticeHeading}>
                {language === 'ar' ? 'هل لديك حساب في والز شوب؟' : 'Already have a WallsShop account?'}
              </p>
              <p className={styles.authNoticeSub}>
                {language === 'ar'
                  ? 'سجل دخولك الآن لمزامنة سلتك وتأكيد طلبك في ثوانٍ معدودة.'
                  : 'Sign in to access saved addresses and synchronize your cart.'}
              </p>
            </div>
          </div>
          <Link to="/login?redirect=/checkout" className={styles.authNoticeBtn}>
            <LogIn size={16} />
            <span>{t('login')}</span>
          </Link>
        </div>
      )}

      <div className={styles.checkoutGrid}>
        {/* Left / Shipping Form */}
        <form className={styles.shippingForm} onSubmit={handleSubmit}>
          <h2 className={styles.formSectionTitle}>{t('deliveryDetails')}</h2>

          <div className={styles.formGroup}>
            <label htmlFor="fullName" className={styles.label}>
              {t('fullName')} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder={t('fullNamePlaceholder')}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phoneNumber" className={styles.label}>
              {t('phone')} <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder={t('phonePlaceholder')}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              {t('address')} <span className={styles.required}>*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={t('addressPlaceholder')}
              className={styles.textarea}
              rows={3}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="note" className={styles.label}>
              {t('orderNotes')}
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder={t('orderNotesPlaceholder')}
              className={styles.textarea}
              rows={2}
            />
          </div>

          {/* Value props */}
          <div className={styles.checkoutTrust}>
            <div className={styles.trustRow}>
              <Truck size={20} className={styles.trustIcon} />
              <span>{language === 'ar' ? 'فريق توصيل وتجميع مخصص ومحترف' : 'White-Glove Delivery & Assembly included'}</span>
            </div>
            <div className={styles.trustRow}>
              <ShieldCheck size={20} className={styles.trustIcon} />
              <span>{language === 'ar' ? 'معاينة وفحص القطع عند الاستلام' : 'Inspection on arrival guaranteed'}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.placeOrderBtn}
          >
            <Lock size={18} />
            <span>{isSubmitting ? t('orderProcessing') : t('confirmOrder')}</span>
          </button>
        </form>

        {/* Right / Order Summary */}
        <div className={styles.orderSummaryCard}>
          <h3 className={styles.summaryTitle}>{t('orderSummary')}</h3>

          <div className={styles.itemsList}>
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}-${item.colorId}`} className={styles.summaryItem}>
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.productName}
                  className={styles.itemImg}
                />
                <div className={styles.itemMeta}>
                  <h4 className={styles.itemTitle}>{item.productName}</h4>
                  <div className={styles.itemTags}>
                    {item.color && <span>{item.color}</span>}
                    {item.size && <span>{item.size}</span>}
                    <span>x{item.quantity}</span>
                  </div>
                </div>
                <span className={styles.itemPrice}>
                  {(item.unitPrice * item.quantity).toLocaleString()} {t('currency')}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.summaryDivider} />

          <div className={styles.calcRows}>
            <div className={styles.calcRow}>
              <span>{t('subtotal')}</span>
              <span>{summary.totalOriginalPrice.toLocaleString()} {t('currency')}</span>
            </div>

            {summary.totalDiscount > 0 && (
              <div className={`${styles.calcRow} ${styles.savings}`}>
                <span>{t('totalSavings')}</span>
                <span>-{summary.totalDiscount.toLocaleString()} {t('currency')}</span>
              </div>
            )}

            <div className={styles.calcRow}>
              <span>{language === 'ar' ? 'التوصيل والتركيب' : 'Delivery & Assembly'}</span>
              <span className={styles.freeTag}>{language === 'ar' ? 'مجاني' : 'FREE'}</span>
            </div>

            <div className={`${styles.calcRow} ${styles.grandTotal}`}>
              <span>{t('totalPrice')}</span>
              <span>{summary.totalPrice.toLocaleString()} {t('currency')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
