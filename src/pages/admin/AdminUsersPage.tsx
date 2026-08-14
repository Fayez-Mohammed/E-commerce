import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  UserX,
  Trash2,
  UserPlus,
  Check,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { CustomerDto } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { getErrorMessage } from '@/services/api';
import styles from './AdminUsersPage.module.css';

export const AdminUsersPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t, language } = useLanguageStore();
  const { success, error: toastError } = useToast();

  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Admin Modal
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllCustomers();
      setCustomers(data);
    } catch {
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleBlock = async (id: string, currentBlocked: boolean) => {
    try {
      const res = await adminService.toggleBlockCustomer(id);
      success(
        res ||
          (currentBlocked
            ? language === 'ar'
              ? 'تم إلغاء حظر المستخدم'
              : 'Customer unblocked'
            : language === 'ar'
            ? 'تم حظر المستخدم'
            : 'Customer blocked')
      );
      fetchCustomers();
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل تعديل حالة الحظر' : 'Failed to change block status'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirmDeleteText'))) return;
    try {
      await adminService.deleteCustomer(id);
      success(language === 'ar' ? 'تم حذف المستخدم' : 'Customer deleted');
      fetchCustomers();
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل حذف المستخدم' : 'Failed to delete customer'));
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    try {
      const res = await adminService.registerAdmin({
        displayName: adminFormData.displayName.trim(),
        email: adminFormData.email.trim(),
        phoneNumber: adminFormData.phoneNumber.trim(),
        password: adminFormData.password,
      });
      success(res || (language === 'ar' ? 'تم تسجيل المشرف بنجاح' : 'Admin registered successfully'));
      setIsAddAdminOpen(false);
      setAdminFormData({ displayName: '', email: '', phoneNumber: '', password: '' });
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل إضافة المشرف (مقتصر على البريد الرئيسي)' : 'Failed to register admin'));
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const isSuperAdmin =
    user?.email?.toLowerCase() === 'fayez00mohammed@gmail.com' ||
    user?.email?.toLowerCase() === 'wallsshop@gmail.com';

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>{t('adminCustomers')}</h1>
          <p className={styles.subtitle}>
            {language === 'ar'
              ? `إجمالي ${customers.length} عملاء مسجلين في متجر WallsShop`
              : `${customers.length} total registered customer accounts`}
          </p>
        </div>

        {isSuperAdmin && (
          <button className={styles.addAdminBtn} onClick={() => setIsAddAdminOpen(true)}>
            <UserPlus size={18} />
            <span>{language === 'ar' ? 'إضافة مشرف جديد (Superadmin)' : 'Add New Admin'}</span>
          </button>
        )}
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>{t('name')}</th>
                <th>{t('email')}</th>
                <th>{t('phone')}</th>
                <th>{language === 'ar' ? 'تاريخ التسجيل' : 'Registered On'}</th>
                <th>{language === 'ar' ? 'حالة الحساب' : 'Status'}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td><strong>#{c.rowNum}</strong></td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>
                        {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className={styles.userName}>{c.name || c.userName}</span>
                    </div>
                  </td>
                  <td>{c.email}</td>
                  <td>{c.phoneNumber || '-'}</td>
                  <td>{c.createdAt?.slice(0, 10) || '-'}</td>
                  <td>
                    <Badge variant={c.isBlocked ? 'error' : 'success'}>
                      {c.isBlocked
                        ? language === 'ar'
                          ? 'محظور'
                          : 'Blocked'
                        : language === 'ar'
                        ? 'نشط'
                        : 'Active'}
                    </Badge>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={`${styles.blockBtn} ${c.isBlocked ? styles.unblockBtn : ''}`}
                        onClick={() => handleToggleBlock(c.id, Boolean(c.isBlocked))}
                        title={c.isBlocked ? t('unblockCustomer') : t('blockCustomer')}
                      >
                        {c.isBlocked ? <UserCheck size={16} /> : <UserX size={16} />}
                      </button>

                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(c.id)}
                        title={t('confirmDeleteTitle')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>
                    {language === 'ar' ? 'لا يوجد عملاء مسجلون حالياً' : 'No registered customers found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <Modal
        isOpen={isAddAdminOpen}
        onClose={() => setIsAddAdminOpen(false)}
        title={language === 'ar' ? 'تسجيل مشرف جديد في النظام' : 'Register New Administrator'}
        maxWidth="md"
      >
        <form onSubmit={handleCreateAdmin} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('name')} *</label>
            <input
              type="text"
              value={adminFormData.displayName}
              onChange={(e) => setAdminFormData({ ...adminFormData, displayName: e.target.value })}
              placeholder={t('fullNamePlaceholder')}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('email')} *</label>
            <input
              type="email"
              value={adminFormData.email}
              onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
              placeholder="admin@domain.com"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('phone')} *</label>
            <input
              type="tel"
              value={adminFormData.phoneNumber}
              onChange={(e) => setAdminFormData({ ...adminFormData, phoneNumber: e.target.value })}
              placeholder={t('phonePlaceholder')}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('password')} *</label>
            <input
              type="password"
              value={adminFormData.password}
              onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
              placeholder="••••••••"
              className={styles.input}
              required
              minLength={6}
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={() => setIsAddAdminOpen(false)} className={styles.cancelBtn}>
              {t('cancel')}
            </button>
            <button type="submit" disabled={isCreatingAdmin} className={styles.saveBtn}>
              <Check size={16} />
              <span>{isCreatingAdmin ? t('loading') : t('createAccount')}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
