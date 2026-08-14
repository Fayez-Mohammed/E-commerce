import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Check, Image as ImageIcon } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { categoryService } from '@/services/categoryService';
import { DashboardOffer, CategoryItem } from '@/types';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { getImageUrl, getErrorMessage } from '@/services/api';
import styles from './AdminOffersPage.module.css';

export const AdminOffersPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const { success, error: toastError } = useToast();

  const [offers, setOffers] = useState<DashboardOffer[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [titleAR, setTitleAR] = useState('');
  const [titleEN, setTitleEN] = useState('');
  const [descriptionAR, setDescriptionAR] = useState('');
  const [descriptionEN, setDescriptionEN] = useState('');
  const [categoryValue, setCategoryValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageUrlLink, setImageUrlLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllOffers();
      setOffers(data);
    } catch {
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    categoryService.getCategories().then((cats) => setCategories(cats));
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setTitleAR('');
    setTitleEN('');
    setDescriptionAR('');
    setDescriptionEN('');
    setCategoryValue(categories[0]?.categoryValue || '');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
    setIsActive(true);
    setImageUrlLink('');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (offer: DashboardOffer) => {
    setEditingId(offer.id);
    setTitleAR(offer.titleAR || '');
    setTitleEN(offer.titleEN || '');
    setDescriptionAR(offer.descriptionAR || '');
    setDescriptionEN(offer.descriptionEN || '');
    setCategoryValue(offer.categoryValue || categories[0]?.categoryValue || '');
    setStartDate(offer.startDate ? offer.startDate.slice(0, 10) : '');
    setEndDate(offer.endDate ? offer.endDate.slice(0, 10) : '');
    setIsActive(offer.isActive ?? true);
    setImageUrlLink(offer.imageUrl || '');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAR.trim() && !titleEN.trim()) {
      toastError(language === 'ar' ? 'يرجى إدخال عنوان العرض' : 'Please enter offer title');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('TitleAR', titleAR.trim() || titleEN.trim());
      formData.append('TitleEN', titleEN.trim() || titleAR.trim());
      formData.append('DescriptionAR', descriptionAR.trim() || descriptionEN.trim());
      formData.append('DescriptionEN', descriptionEN.trim() || descriptionAR.trim());
      formData.append('CategoryValue', categoryValue);
      formData.append('StartDate', startDate);
      formData.append('EndDate', endDate);
      formData.append('IsActive', String(isActive));

      if (imageUrlLink.trim()) {
        formData.append('ImageUrlLink', imageUrlLink.trim());
      }
      if (imageFile) {
        formData.append('ImageFile', imageFile);
      }

      if (editingId) {
        await adminService.updateOffer(editingId, formData);
        success(language === 'ar' ? 'تم تحديث العرض بنجاح' : 'Offer updated successfully');
      } else {
        await adminService.createOffer(formData);
        success(language === 'ar' ? 'تم إنشاء العرض بنجاح' : 'Offer created successfully');
      }

      setIsModalOpen(false);
      fetchOffers();
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل حفظ العرض' : 'Failed to save offer'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('confirmDeleteText'))) return;
    try {
      await adminService.deleteOffer(id);
      success(language === 'ar' ? 'تم حذف العرض' : 'Offer deleted successfully');
      fetchOffers();
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل حذف العرض' : 'Failed to delete offer'));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>{t('adminOffers')}</h1>
          <p className={styles.subtitle}>
            {language === 'ar'
              ? 'إدارة الحملات الترويجية والخصومات الموسمية في المتجر'
              : 'Manage seasonal campaigns, discounts and promotional banners'}
          </p>
        </div>

        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={18} />
          <span>{language === 'ar' ? 'إنشاء عرض جديد' : 'Create Offer'}</span>
        </button>
      </div>

      <div className={styles.grid}>
        {offers.map((offer) => {
          const isCurrentActive =
            offer.isActive &&
            new Date(offer.startDate) <= new Date() &&
            new Date(offer.endDate) >= new Date();
          const displayName = language === 'ar' ? (offer.titleAR || offer.titleEN) : (offer.titleEN || offer.titleAR);
          const displayDesc = language === 'ar' ? (offer.descriptionAR || offer.descriptionEN) : (offer.descriptionEN || offer.descriptionAR);

          return (
            <div key={offer.id} className={styles.offerCard}>
              <div className={styles.imageBox}>
                <img src={getImageUrl(offer.imageUrl)} alt={displayName || 'Offer'} />
                <span className={`${styles.statusBadge} ${isCurrentActive ? styles.activeBadge : ''}`}>
                  {isCurrentActive
                    ? language === 'ar'
                      ? 'نشط الآن'
                      : 'Live Now'
                    : language === 'ar'
                    ? 'غير نشط'
                    : 'Inactive'}
                </span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.offerName}>{displayName}</h3>
                <p className={styles.offerDesc}>{displayDesc}</p>

                <div className={styles.dateRow}>
                  <Calendar size={14} />
                  <span>
                    {offer.startDate?.slice(0, 10)} ➔ {offer.endDate?.slice(0, 10)}
                  </span>
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.editBtn} onClick={() => openEditModal(offer)} title="Edit Offer">
                    <Edit2 size={16} />
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(offer.id)} title="Delete Offer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingId
            ? language === 'ar'
              ? 'تعديل العرض الترويجي'
              : 'Edit Promotional Offer'
            : language === 'ar'
            ? 'إنشاء عرض ترويجي جديد'
            : 'Create Promotional Offer'
        }
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'عنوان العرض (عربي) *' : 'Title (Arabic) *'}</label>
              <input
                type="text"
                value={titleAR}
                onChange={(e) => setTitleAR(e.target.value)}
                placeholder="مثال: خصم 30% على غرف النوم"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'عنوان العرض (إنجليزي) *' : 'Title (English) *'}</label>
              <input
                type="text"
                value={titleEN}
                onChange={(e) => setTitleEN(e.target.value)}
                placeholder="e.g. 30% Discount on Bedrooms"
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'وصف العرض (عربي)' : 'Description (Arabic)'}</label>
              <textarea
                value={descriptionAR}
                onChange={(e) => setDescriptionAR(e.target.value)}
                placeholder="تفاصيل الحملة الترويجية بالعربية..."
                className={styles.textarea}
                rows={2}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'وصف العرض (إنجليزي)' : 'Description (English)'}</label>
              <textarea
                value={descriptionEN}
                onChange={(e) => setDescriptionEN(e.target.value)}
                placeholder="Campaign details in English..."
                className={styles.textarea}
                rows={2}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'تاريخ البداية' : 'Start Date'}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'تاريخ النهاية' : 'End Date'}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'القسم المرتبط' : 'Target Category'}</label>
              <select
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value)}
                className={styles.input}
              >
                <option value="">{language === 'ar' ? 'جميع الأقسام' : 'All Categories'}</option>
                {categories.map((c) => (
                  <option key={c.categoryValue} value={c.categoryValue}>
                    {c.category}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'حالة التفعيل' : 'Active Status'}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}>
                <input
                  type="checkbox"
                  id="offerActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="offerActive" style={{ cursor: 'pointer', fontWeight: 600 }}>
                  {isActive
                    ? language === 'ar'
                      ? 'العرض مفعل'
                      : 'Offer is Active'
                    : language === 'ar'
                    ? 'العرض معطل'
                    : 'Offer is Inactive'}
                </label>
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'رابط الصورة (اختياري)' : 'Image URL Link (Optional)'}</label>
              <input
                type="url"
                value={imageUrlLink}
                onChange={(e) => setImageUrlLink(e.target.value)}
                placeholder="https://..."
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'أو رفع ملف صورة' : 'Or Upload Image File'}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className={styles.fileInput}
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
              {t('cancel')}
            </button>
            <button type="submit" disabled={isSaving} className={styles.saveBtn}>
              <Check size={16} />
              <span>{isSaving ? t('loading') : t('saveChanges')}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
