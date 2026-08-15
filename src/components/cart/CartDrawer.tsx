import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useLanguageStore } from '@/stores/languageStore';
import { getImageUrl } from '@/services/api';
import styles from './CartDrawer.module.css';

export const CartDrawer: React.FC = () => {
  const { items, summary, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const { t, language, direction } = useLanguageStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  const isRtl = direction === 'rtl';

  return (
    <div className={styles.overlay} onClick={closeCart}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <ShoppingBag size={20} className={styles.titleIcon} />
            <h3>{t('cart')}</h3>
            <span className={styles.itemsCount}>
              ({summary.totalProductsCount} {summary.totalProductsCount === 1 ? t('item') : t('items')})
            </span>
          </div>

          <button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ShoppingBag size={48} />
              </div>
              <h4>{t('cartEmpty')}</h4>
              <p>{t('cartEmptySubtitle')}</p>
              <button
                className={styles.shopBtn}
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
              >
                <span>{t('startShopping')}</span>
                {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </button>
            </div>
          ) : (
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}-${item.colorId}`} className={styles.itemRow}>
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.productName}
                    className={styles.itemImage}
                  />

                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <h4 className={styles.itemName}>{item.productName}</h4>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => removeItem(item.productId, item.variantId, item.colorId)}
                        title={t('remove')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Variant & Color Tags */}
                    <div className={styles.tags}>
                      {item.color && (
                        <span className={styles.tag}>
                          {language === 'ar' ? item.color : item.englishColor || item.color}
                        </span>
                      )}
                      {item.size && (
                        <span className={styles.tag}>
                          <bdi dir="ltr">{item.size}</bdi>
                        </span>
                      )}
                      {item.type && (
                        <span className={styles.tag}>
                          <bdi>{item.type}</bdi>
                        </span>
                      )}
                    </div>

                    {/* Quantity & Unit Price */}
                    <div className={styles.itemFooter}>
                      <div className={styles.quantityControls}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity - 1,
                              item.colorId
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity + 1,
                              item.colorId
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className={styles.priceColumn}>
                        <span className={styles.itemPrice}>
                          {(item.unitPrice * item.quantity).toLocaleString()} {t('currency')}
                        </span>
                        {item.originalPrice > item.unitPrice && (
                          <span className={styles.itemOriginalPrice}>
                            {(item.originalPrice * item.quantity).toLocaleString()} {t('currency')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{t('subtotal')}</span>
              <span className={styles.summaryValue}>
                {summary.totalOriginalPrice.toLocaleString()} {t('currency')}
              </span>
            </div>

            {summary.totalDiscount > 0 && (
              <div className={`${styles.summaryRow} ${styles.savingsRow}`}>
                <span className={styles.summaryLabel}>{t('totalSavings')}</span>
                <span className={styles.savingsValue}>
                  -{summary.totalDiscount.toLocaleString()} {t('currency')}
                </span>
              </div>
            )}

            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span className={styles.totalLabel}>{t('totalPrice')}</span>
              <span className={styles.totalValue}>
                {summary.totalPrice.toLocaleString()} {t('currency')}
              </span>
            </div>

            <button className={styles.checkoutBtn} onClick={handleCheckoutClick}>
              <span>{t('checkout')}</span>
              {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
