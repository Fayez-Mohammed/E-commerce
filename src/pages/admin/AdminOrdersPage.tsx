import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Package,
  Calendar,
  Phone,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { OrderDashboardDto, OrderFullDetail } from '@/types';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { getImageUrl, getErrorMessage, normalizeOrderStatus } from '@/services/api';
import styles from './AdminOrdersPage.module.css';

export const AdminOrdersPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const { success, error: toastError } = useToast();
  const [searchParams] = useSearchParams();
  const inspectIdParam = searchParams.get('id');

  const [orders, setOrders] = useState<OrderDashboardDto[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Inspection Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderFullDetail | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [language]);

  // Open modal if id param in URL
  useEffect(() => {
    if (inspectIdParam) {
      inspectOrder(Number(inspectIdParam));
    }
  }, [inspectIdParam]);

  const inspectOrder = async (id: number) => {
    setLoadingDetails(true);
    setIsDetailsOpen(true);
    try {
      const details = await adminService.getOrderDetails(id);
      setSelectedOrder(details);
    } catch {
      toastError(language === 'ar' ? 'فشل تحميل تفاصيل الطلب' : 'Failed to fetch order details');
      setIsDetailsOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleConfirmOrder = async (id: number) => {
    try {
      await adminService.confirmOrder(id);
      success(language === 'ar' ? 'تم تأكيد الطلب بنجاح' : 'Order confirmed successfully');
      fetchOrders();
      if (selectedOrder?.id === id) {
        inspectOrder(id);
      }
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل تأكيد الطلب' : 'Failed to confirm order'));
    }
  };

  const handleCancelOrder = async (id: number) => {
    try {
      await adminService.cancelOrder(id);
      success(language === 'ar' ? 'تم إلغاء الطلب' : 'Order canceled');
      fetchOrders();
      if (selectedOrder?.id === id) {
        inspectOrder(id);
      }
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل إلغاء الطلب' : 'Failed to cancel order'));
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm(t('confirmDeleteText'))) return;
    try {
      await adminService.deleteOrder(id);
      success(language === 'ar' ? 'تم حذف الطلب' : 'Order deleted');
      setIsDetailsOpen(false);
      fetchOrders();
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل حذف الطلب' : 'Failed to delete order'));
    }
  };

  const handleExportXml = async () => {
    setIsExporting(true);
    try {
      await adminService.downloadOrdersXml();
      success(language === 'ar' ? 'تم تصدير ملف الطلبات بنجاح' : 'Orders XML exported');
    } catch {
      toastError(language === 'ar' ? 'فشل التصدير' : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === 'all') return true;
    return normalizeOrderStatus(o.status) === selectedStatus;
  });

  return (
    <div className={styles.page}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>{t('adminOrders')}</h1>
          <p className={styles.pageSub}>
            {language === 'ar'
              ? `إجمالي ${orders.length} طلبات مسجلة في النظام`
              : `${orders.length} total customer orders in pipeline`}
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.exportBtn} onClick={handleExportXml} disabled={isExporting}>
            <FileSpreadsheet size={18} className={styles.exportIcon} />
            <span>{isExporting ? t('loading') : t('exportOrdersXml')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        {['all', 'Pending', 'Confirmed', 'Canceled'].map((st) => (
          <button
            key={st}
            className={`${styles.filterTab} ${selectedStatus === st ? styles.tabActive : ''}`}
            onClick={() => setSelectedStatus(st)}
          >
            {st === 'all'
              ? language === 'ar'
                ? 'جميع الطلبات'
                : 'All Orders'
              : st === 'Pending'
              ? t('statusPending')
              : st === 'Confirmed'
              ? t('statusConfirmed')
              : t('statusCanceled')}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>{t('fullName')}</th>
                <th>{t('phone')}</th>
                <th>{language === 'ar' ? 'العنوان' : 'Address'}</th>
                <th>{language === 'ar' ? 'تاريخ الطلب' : 'Date'}</th>
                <th>{language === 'ar' ? 'الكمية' : 'Items'}</th>
                <th>{t('totalPrice')}</th>
                <th>{t('orderStatus')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const normStatus = normalizeOrderStatus(order.status);
                const badgeVariant =
                  normStatus === 'Confirmed' ? 'success' : normStatus === 'Canceled' ? 'error' : 'warning';
                return (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{order.customerName || '-'}</td>
                    <td>{order.phoneNumber || '-'}</td>
                    <td>{order.address || '-'}</td>
                    <td>{order.orderDate?.slice(0, 10) || '-'}</td>
                    <td>{order.itemsCount || 1}</td>
                    <td>
                      <strong>{order.totalPrice?.toLocaleString()} {t('currency')}</strong>
                    </td>
                    <td>
                      <Badge variant={badgeVariant}>
                        {normStatus === 'Confirmed'
                          ? t('statusConfirmed')
                          : normStatus === 'Canceled'
                          ? t('statusCanceled')
                          : t('statusPending')}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.inspectBtn}
                          onClick={() => inspectOrder(order.id)}
                          title={t('orderDetails')}
                        >
                          <Eye size={16} />
                        </button>
                        {normStatus !== 'Confirmed' && (
                          <button
                            className={styles.confirmBtn}
                            onClick={() => handleConfirmOrder(order.id)}
                            title={t('confirmStatus')}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {normStatus !== 'Canceled' && (
                          <button
                            className={styles.cancelBtn}
                            onClick={() => handleCancelOrder(order.id)}
                            title={t('cancelStatus')}
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteOrder(order.id)}
                          title={t('deleteOrder')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={9} className={styles.emptyCell}>
                    {language === 'ar' ? 'لا توجد طلبات في هذا القسم' : 'No orders in this category'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={`${t('orderDetails')} #${selectedOrder?.id}`}
        maxWidth="lg"
      >
        {loadingDetails ? (
          <div className={styles.modalLoading}>
            <div className={styles.spinner} />
            <p>{t('loading')}</p>
          </div>
        ) : selectedOrder ? (
          <div className={styles.orderDetailsBody}>
            {/* Customer & Shipping Details Box */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailBox}>
                <h4>{language === 'ar' ? 'بيانات العميل' : 'Customer Info'}</h4>
                <p><strong>{t('fullName')}:</strong> {selectedOrder.customerName || '-'}</p>
                <p><strong>{t('phone')}:</strong> {selectedOrder.phoneNumber || '-'}</p>
                <p><strong>{t('email')}:</strong> {selectedOrder.customerEmail || '-'}</p>
              </div>

              <div className={styles.detailBox}>
                <h4>{language === 'ar' ? 'بيانات الشحن والتوصيل' : 'Shipping Info'}</h4>
                <p><strong>{t('address')}:</strong> {selectedOrder.address || '-'}</p>
                <p><strong>{language === 'ar' ? 'تاريخ الطلب' : 'Date'}:</strong> {selectedOrder.orderDate || '-'}</p>
                {selectedOrder.note && (
                  <p><strong>{t('orderNotes')}:</strong> {selectedOrder.note}</p>
                )}
              </div>
            </div>

            {/* Status Bar */}
            <div className={styles.modalStatusRow}>
              <span>{t('orderStatus')}:</span>
              {(() => {
                const modalNormStatus = normalizeOrderStatus(selectedOrder.status);
                const modalBadgeVariant =
                  modalNormStatus === 'Confirmed' ? 'success' : modalNormStatus === 'Canceled' ? 'error' : 'warning';
                return (
                  <Badge variant={modalBadgeVariant}>
                    {modalNormStatus === 'Confirmed'
                      ? t('statusConfirmed')
                      : modalNormStatus === 'Canceled'
                      ? t('statusCanceled')
                      : t('statusPending')}
                  </Badge>
                );
              })()}
            </div>

            {/* Items Purchased */}
            <div className={styles.itemsSection}>
              <h4>{language === 'ar' ? 'المنتجات المطلوبة' : 'Ordered Items'}</h4>
              <div className={styles.itemsTable}>
                {(() => {
                  const orderItems = selectedOrder.items || selectedOrder.orderDetailsList || [];
                  if (orderItems.length === 0) {
                    return (
                      <p className={styles.noItems}>
                        {language === 'ar' ? 'تفاصيل العناصر غير متوفرة' : 'No items listed'}
                      </p>
                    );
                  }

                  return orderItems.map((item, idx) => {
                    const itemImg = Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl;

                    return (
                      <div key={idx} className={styles.itemCard}>
                        <div className={styles.itemLeft}>
                          {itemImg && (
                            <img
                              src={getImageUrl(itemImg)}
                              alt={item.productName}
                              className={styles.itemThumb}
                            />
                          )}
                          <div>
                            <p className={styles.itemProductName}>{item.productName}</p>
                            <div className={styles.itemSubTags}>
                              {item.color && (
                                <span>{language === 'ar' ? 'اللون:' : 'Color:'} {item.color}</span>
                              )}
                              {item.size && (
                                <span>{language === 'ar' ? 'المقاس:' : 'Size:'} {item.size}</span>
                              )}
                              {item.type && (
                                <span>{language === 'ar' ? 'النوع:' : 'Type:'} {item.type}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={styles.itemCardPrice}>
                          <span>
                            {item.quantity} × {item.price?.toLocaleString()} {t('currency')}
                          </span>
                          <strong>
                            {(item.quantity * item.price).toLocaleString()} {t('currency')}
                          </strong>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Total Grand */}
            <div className={styles.modalTotalRow}>
              <span>{t('totalPrice')}:</span>
              <span className={styles.modalTotalValue}>
                {selectedOrder.totalPrice?.toLocaleString()} {t('currency')}
              </span>
            </div>

            {/* Actions in Modal */}
            <div className={styles.modalActions}>
              {(() => {
                const modalNormStatus = normalizeOrderStatus(selectedOrder.status);
                return (
                  <>
                    {modalNormStatus !== 'Confirmed' && (
                      <button
                        className={styles.modalConfirmBtn}
                        onClick={() => handleConfirmOrder(selectedOrder.id)}
                      >
                        <CheckCircle size={16} />
                        <span>{t('confirmStatus')}</span>
                      </button>
                    )}
                    {modalNormStatus !== 'Canceled' && (
                      <button
                        className={styles.modalCancelBtn}
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                      >
                        <XCircle size={16} />
                        <span>{t('cancelStatus')}</span>
                      </button>
                    )}
                    <button
                      className={styles.modalDeleteBtn}
                      onClick={() => handleDeleteOrder(selectedOrder.id)}
                    >
                      <Trash2 size={16} />
                      <span>{t('deleteOrder')}</span>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
