import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Layers,
  Sparkles,
  Download,
  Plus,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { DashboardSummary, OrderDashboardDto } from '@/types';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { Badge } from '@/components/common/Badge';
import { normalizeOrderStatus } from '@/services/api';
import styles from './AdminOverviewPage.module.css';

export const AdminOverviewPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const { success, error: toastError } = useToast();

  const [summary, setSummary] = useState<DashboardSummary>({
    totalProducts: 0,
    totalCategories: 0,
    totalOffers: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalSales: 0,
  });

  const [recentOrders, setRecentOrders] = useState<OrderDashboardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const [sum, orders] = await Promise.all([
          adminService.getSummary(),
          adminService.getAllOrders(),
        ]);
        setSummary(sum);
        setRecentOrders(orders);
      } catch (err) {
        toastError(language === 'ar' ? 'فشل تحميل بيانات لوحة التحكم' : 'Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [language]);

  const handleExportXml = async () => {
    setIsExporting(true);
    try {
      await adminService.downloadOrdersXml();
      success(language === 'ar' ? 'تم تصدير ملف الطلبات بنجاح' : 'Orders XML exported successfully');
    } catch {
      toastError(language === 'ar' ? 'فشل في تصدير الملف' : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = [
    {
      title: t('totalSales'),
      value: `${summary.totalSales.toLocaleString()} ${t('currency')}`,
      icon: <DollarSign size={24} />,
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      title: t('totalOrders'),
      value: summary.totalOrders.toLocaleString(),
      icon: <ShoppingBag size={24} />,
      color: '#3B82F6',
      bg: '#EFF6FF',
    },
    {
      title: t('totalProducts'),
      value: summary.totalProducts.toLocaleString(),
      icon: <Package size={24} />,
      color: '#D97706',
      bg: '#FEF3C7',
    },
    {
      title: t('totalUsers'),
      value: summary.totalUsers.toLocaleString(),
      icon: <Users size={24} />,
      color: '#8B5CF6',
      bg: '#F5F3FF',
    },
    {
      title: t('adminCategories'),
      value: summary.totalCategories.toLocaleString(),
      icon: <Layers size={24} />,
      color: '#06B6D4',
      bg: '#ECFEFF',
    },
    {
      title: t('activeOffers'),
      value: summary.totalOffers.toLocaleString(),
      icon: <Sparkles size={24} />,
      color: '#F43F5E',
      bg: '#FFF1F2',
    },
  ];

  return (
    <div className={styles.overviewPage}>
      {/* Quick Action Top Bar */}
      <div className={styles.topActionsBar}>
        <div>
          <h1 className={styles.overviewHeading}>{t('adminOverview')}</h1>
          <p className={styles.overviewSub}>
            {language === 'ar'
              ? 'مؤشرات الأداء الرئيسية والعمليات التشغيلية لمتجر WallsShop Furniture'
              : 'Real-time sales, order volume, and catalog status'}
          </p>
        </div>

        <div className={styles.actionButtons}>
          <button
            className={styles.exportBtn}
            onClick={handleExportXml}
            disabled={isExporting}
          >
            <Download size={16} />
            <span>{isExporting ? t('loading') : t('exportOrdersXml')}</span>
          </button>

          <Link to="/admin/products" className={styles.addProductBtn}>
            <Plus size={16} />
            <span>{t('addProduct')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi, idx) => (
          <div key={idx} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>{kpi.title}</span>
              <div className={styles.kpiIcon} style={{ color: kpi.color, backgroundColor: kpi.bg }}>
                {kpi.icon}
              </div>
            </div>
            <span className={styles.kpiValue}>{isLoading ? '...' : kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              {language === 'ar' ? 'أحدث الطلبات المستلمة' : 'Recent Customer Orders'}
            </h2>
            <p className={styles.sectionSub}>
              {language === 'ar' ? 'عرض آخر المعاملات وحالات التأكيد' : 'Latest orders requiring processing and confirmation'}
            </p>
          </div>

          <Link to="/admin/orders" className={styles.viewAllBtn}>
            <span>{t('viewAll')}</span>
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>{t('fullName')}</th>
                <th>{t('phone')}</th>
                <th>{language === 'ar' ? 'المدينة / العنوان' : 'Address'}</th>
                <th>{language === 'ar' ? 'المنتجات' : 'Items'}</th>
                <th>{t('totalPrice')}</th>
                <th>{t('orderStatus')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.slice(0, 6).map((order) => {
                const normStatus = normalizeOrderStatus(order.status);
                const badgeVariant =
                  normStatus === 'Confirmed' ? 'success' : normStatus === 'Canceled' ? 'error' : 'warning';
                return (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{order.customerName || '-'}</td>
                    <td>{order.phoneNumber || '-'}</td>
                    <td>{order.address || '-'}</td>
                    <td>{order.itemsCount || 1}</td>
                    <td>
                      <strong>
                        {order.totalPrice?.toLocaleString()} {t('currency')}
                      </strong>
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
                      <Link to={`/admin/orders?id=${order.id}`} className={styles.inspectBtn}>
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className={styles.noDataCell}>
                    {language === 'ar' ? 'لا توجد طلبات مسجلة حتى الآن' : 'No orders recorded yet'}
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
