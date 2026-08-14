import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Layers, Check } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { DashboardCategory } from '@/types';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { getImageUrl, getErrorMessage } from '@/services/api';
import styles from './AdminCategoriesPage.module.css';

export const AdminCategoriesPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState<DashboardCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nameAR, setNameAR] = useState('');
  const [nameEN, setNameEN] = useState('');
  const [imageUrlLink, setImageUrlLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllCategories();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setNameAR('');
    setNameEN('');
    setImageUrlLink('');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: DashboardCategory) => {
    setEditingId(cat.id);
    setNameAR(cat.nameAR || '');
    setNameEN(cat.nameEN || '');
    setImageUrlLink(cat.imageUrl || '');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAR.trim() || !nameEN.trim()) {
      toastError(language === 'ar' ? 'يرجى إدخال اسم القسم باللغتين' : 'Please enter category names');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('NameAR', nameAR.trim());
      formData.append('NameEN', nameEN.trim());
      if (imageUrlLink.trim()) {
        formData.append('ImageUrlLink', imageUrlLink.trim());
      }
      if (imageFile) {
        formData.append('ImageFile', imageFile);
      }

      if (editingId) {
        await adminService.updateCategory(editingId, formData);
        success(language === 'ar' ? 'تم تعديل القسم بنجاح' : 'Category updated');
      } else {
        await adminService.createCategory(formData);
        success(language === 'ar' ? 'تم إنشاء القسم بنجاح' : 'Category created');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل حفظ القسم' : 'Failed to save category'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('confirmDeleteText'))) return;
    try {
      await adminService.deleteCategory(id);
      success(language === 'ar' ? 'تم حذف القسم' : 'Category deleted');
      fetchCategories();
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل حذف القسم' : 'Failed to delete category'));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>{t('adminCategories')}</h1>
          <p className={styles.subtitle}>
            {language === 'ar' ? 'إدارة أقسام وتصنيفات الأثاث المعروضة في المتجر' : 'Manage furniture departments and catalog categories'}
          </p>
        </div>

        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={18} />
          <span>{language === 'ar' ? 'إضافة قسم جديد' : 'Add Category'}</span>
        </button>
      </div>

      <div className={styles.grid}>
        {categories.map((cat) => (
          <div key={cat.id} className={styles.categoryCard}>
            <div className={styles.imageBox}>
              <img src={getImageUrl(cat.imageUrl)} alt={cat.nameAR} />
            </div>

            <div className={styles.cardContent}>
              <div className={styles.namesRow}>
                <h3 className={styles.arName}>{cat.nameAR}</h3>
                <span className={styles.enName}>{cat.nameEN}</span>
              </div>
              <span className={styles.slugTag}>Slug: {cat.categoryValue}</span>

              <div className={styles.cardActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => openEditModal(cat)}
                  title={t('saveChanges')}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(cat.id)}
                  title={t('confirmDeleteTitle')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? (language === 'ar' ? 'تعديل القسم' : 'Edit Category') : (language === 'ar' ? 'إضافة قسم' : 'Add Category')}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{language === 'ar' ? 'اسم القسم (عربي) *' : 'Category Name (Arabic) *'}</label>
            <input
              type="text"
              value={nameAR}
              onChange={(e) => setNameAR(e.target.value)}
              placeholder="مثال: غرف المعيشة"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{language === 'ar' ? 'اسم القسم (إنجليزي) *' : 'Category Name (English) *'}</label>
            <input
              type="text"
              value={nameEN}
              onChange={(e) => setNameEN(e.target.value)}
              placeholder="e.g. Living Room"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{language === 'ar' ? 'رابط الصورة (URL)' : 'Image URL (Optional)'}</label>
            <input
              type="url"
              value={imageUrlLink}
              onChange={(e) => setImageUrlLink(e.target.value)}
              placeholder="https://..."
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{language === 'ar' ? 'أو ارفع ملف صورة' : 'Or Upload Image File'}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className={styles.fileInput}
            />
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
