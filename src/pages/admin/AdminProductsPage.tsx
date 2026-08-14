import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { categoryService } from '@/services/categoryService';
import { CategoryItem } from '@/types';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { getImageUrl, getErrorMessage } from '@/services/api';
import styles from './AdminProductsPage.module.css';

interface ProductFormData {
  id?: number;
  nameAr: string;
  nameEn: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  fullDescriptionAr: string;
  fullDescriptionEn: string;
  categoryValue: string;
  sku: string;
  price: number;
  priceAfterDiscount: number;
  colors: { nameAr: string; nameEn: string }[];
  variants: {
    sizeAr: string;
    sizeEn: string;
    typeAr: string;
    typeEn: string;
    price: number;
    priceAfterDiscount: number;
  }[];
}

const initialForm: ProductFormData = {
  nameAr: '',
  nameEn: '',
  shortDescriptionAr: '',
  shortDescriptionEn: '',
  fullDescriptionAr: '',
  fullDescriptionEn: '',
  categoryValue: '',
  sku: '',
  price: 0,
  priceAfterDiscount: 0,
  colors: [{ nameAr: 'طبيعي', nameEn: 'Natural' }],
  variants: [],
};

export const AdminProductsPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const { success, error: toastError } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialForm);
  const [existingImages, setExistingImages] = useState<{ id: number; path: string }[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);

  // Color input temp state
  const [tempColorAr, setTempColorAr] = useState('');
  const [tempColorEn, setTempColorEn] = useState('');

  // Variant input temp state
  const [tempVariant, setTempVariant] = useState({
    sizeAr: '',
    sizeEn: '',
    typeAr: '',
    typeEn: '',
    price: 0,
    priceAfterDiscount: 0,
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getProductsForDashboard({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        page: currentPage,
        pageSize: 10,
        LanguageCode: language,
      });
      setProducts(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0 && !initialForm.categoryValue) {
        initialForm.categoryValue = cats[0].categoryValue;
      }
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory, language]);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      ...initialForm,
      categoryValue: categories[0]?.categoryValue || '',
      sku: `WS-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setExistingImages([]);
    setDeleteImageIds([]);
    setSelectedImageFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = async (productId: number) => {
    try {
      const raw = await adminService.getProductForEdit(productId);
      if (raw) {
        setIsEditMode(true);
        setFormData({
          id: raw.id,
          nameAr: raw.nameAr || raw.name || '',
          nameEn: raw.nameEn || raw.nameEN || '',
          shortDescriptionAr: raw.shortDescriptionAr || raw.shortDescription || '',
          shortDescriptionEn: raw.shortDescriptionEn || raw.shortDescriptionEN || '',
          fullDescriptionAr: raw.fullDescriptionAr || raw.fullDescription || raw.descriptions || '',
          fullDescriptionEn: raw.fullDescriptionEn || raw.fullDescriptionEN || raw.descriptionsEN || '',
          categoryValue: raw.categoryValue || categories[0]?.categoryValue || '',
          sku: raw.sku || raw.SKU || '',
          price: raw.price || 0,
          priceAfterDiscount: raw.priceAfterDiscount || 0,
          colors:
            raw.colors?.map((c: any) => ({
              nameAr: c.colorName || c.nameAr || c.name || '',
              nameEn: c.englishColor || c.nameEn || c.name || '',
            })) || [],
          variants:
            raw.variants?.map((v: any) => ({
              sizeAr: v.arabicSize || v.sizeAr || v.size || '',
              sizeEn: v.size || v.sizeEn || v.englishSize || '',
              typeAr: v.arabicType || v.typeAr || v.type || '',
              typeEn: v.type || v.typeEn || v.englishType || '',
              price: v.priceBeforeDiscount || v.price || 0,
              priceAfterDiscount: v.price || v.priceAfterDiscount || 0,
            })) || [],
        });
        setExistingImages(
          raw.images?.map((img: any) => ({ id: img.id, path: img.path || img.relativePath || '' })) || []
        );
        setDeleteImageIds([]);
        setSelectedImageFiles([]);
        setIsModalOpen(true);
      }
    } catch (err) {
      toastError(language === 'ar' ? 'فشل تحميل بيانات المنتج للتعديل' : 'Failed to fetch product for edit');
    }
  };

  const handleRemoveExistingImage = (imageId: number) => {
    setDeleteImageIds((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleAddColor = () => {
    if (!tempColorAr.trim()) return;
    setFormData((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        { nameAr: tempColorAr.trim(), nameEn: tempColorEn.trim() || tempColorAr.trim() },
      ],
    }));
    setTempColorAr('');
    setTempColorEn('');
  };

  const handleRemoveColor = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== idx),
    }));
  };

  const handleAddVariant = () => {
    if (!tempVariant.sizeAr.trim() && !tempVariant.typeAr.trim()) return;
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sizeAr: tempVariant.sizeAr.trim(),
          sizeEn: tempVariant.sizeEn.trim() || tempVariant.sizeAr.trim(),
          typeAr: tempVariant.typeAr.trim(),
          typeEn: tempVariant.typeEn.trim() || tempVariant.typeAr.trim(),
          price: Number(tempVariant.price) || formData.price,
          priceAfterDiscount: Number(tempVariant.priceAfterDiscount) || formData.priceAfterDiscount,
        },
      ],
    }));
    setTempVariant({ sizeAr: '', sizeEn: '', typeAr: '', typeEn: '', price: 0, priceAfterDiscount: 0 });
  };

  const handleRemoveVariant = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim() || !formData.nameEn.trim()) {
      toastError(language === 'ar' ? 'يرجى إدخال اسم المنتج باللغتين' : 'Please enter product name in both languages');
      return;
    }

    setIsSaving(true);
    try {
      const productPayload = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        shortDescriptionAr: formData.shortDescriptionAr,
        shortDescriptionEn: formData.shortDescriptionEn,
        fullDescriptionAr: formData.fullDescriptionAr,
        fullDescriptionEn: formData.fullDescriptionEn,
        categoryValue: formData.categoryValue,
        sku: formData.sku,
        price: Number(formData.price),
        priceAfterDiscount: Number(formData.priceAfterDiscount),
        colors: formData.colors.map((c) => ({ NameAr: c.nameAr, NameEn: c.nameEn })),
        variants: formData.variants.map((v) => ({
          Size: { SizeAr: v.sizeAr, SizeEn: v.sizeEn },
          Type: { TypeAr: v.typeAr, TypeEn: v.typeEn },
          Price: Number(v.price),
          PriceAfterDiscount: Number(v.priceAfterDiscount),
        })),
      };

      const data = new FormData();
      data.append('Product', JSON.stringify(productPayload));

      if (isEditMode && formData.id) {
        data.append('Id', String(formData.id));
        selectedImageFiles.forEach((file) => {
          data.append('NewImages', file);
        });
        deleteImageIds.forEach((delId) => {
          data.append('DeleteImageIds', String(delId));
        });
        await adminService.updateProduct(data);
        success(language === 'ar' ? 'تم تعديل المنتج بنجاح' : 'Product updated successfully');
      } else {
        selectedImageFiles.forEach((file) => {
          data.append('Images', file);
        });
        await adminService.addProduct(data);
        success(language === 'ar' ? 'تمت إضافة المنتج بنجاح' : 'Product added successfully');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل حفظ المنتج' : 'Failed to save product'));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await adminService.deleteProduct(productToDelete.id);
      success(language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted');
      setDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل حذف المنتج' : 'Failed to delete product'));
    }
  };

  return (
    <div className={styles.page}>
      {/* Top Header & Search */}
      <div className={styles.topBar}>
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'البحث باسم المنتج أو SKU...' : 'Search by product name or SKU...'}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.catSelect}
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((c) => (
              <option key={c.categoryValue} value={c.categoryValue}>
                {c.category}
              </option>
            ))}
          </select>
        </div>

        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={18} />
          <span>{t('addProduct')}</span>
        </button>
      </div>

      {/* Products Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>{language === 'ar' ? 'الصورة' : 'Image'}</th>
                <th>{language === 'ar' ? 'الاسم' : 'Name'}</th>
                <th>SKU</th>
                <th>{t('categories')}</th>
                <th>{language === 'ar' ? 'السعر الأصلي' : 'Price'}</th>
                <th>{language === 'ar' ? 'بعد الخصم' : 'Discount Price'}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id}>
                  <td><strong>#{prod.id}</strong></td>
                  <td>
                    <img
                      src={getImageUrl(prod.imageUrl)}
                      alt={prod.name}
                      className={styles.thumbImg}
                    />
                  </td>
                  <td>
                    <div className={styles.prodNameCell}>
                      <span className={styles.prodName}>{prod.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.skuBadge}>{prod.sku || '-'}</span>
                  </td>
                  <td>{prod.category || '-'}</td>
                  <td>{prod.price?.toLocaleString()} {t('currency')}</td>
                  <td>
                    {prod.priceAfterDiscount && prod.priceAfterDiscount < prod.price ? (
                      <span className={styles.discountPrice}>
                        {prod.priceAfterDiscount?.toLocaleString()} {t('currency')}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openEditModal(prod.id)}
                        title={t('editProduct')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => {
                          setProductToDelete({ id: prod.id, name: prod.name });
                          setDeleteModalOpen(true);
                        }}
                        title={t('deleteProduct')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className={styles.emptyCell}>
                    {t('noProductsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? t('editProduct') : t('addProduct')}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveProduct} className={styles.productForm}>
          {/* General info */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'اسم المنتج (عربي) *' : 'Product Name (Arabic) *'}</label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className={styles.input}
                placeholder="مثال: كنب زاوية مودرن فاخر"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'اسم المنتج (إنجليزي) *' : 'Product Name (English) *'}</label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className={styles.input}
                placeholder="e.g. Modern Luxury Sectional Sofa"
                required
              />
            </div>
          </div>

          <div className={styles.formRow3}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('categories')} *</label>
              <select
                value={formData.categoryValue}
                onChange={(e) => setFormData({ ...formData, categoryValue: e.target.value })}
                className={styles.input}
              >
                {categories.map((cat) => (
                  <option key={cat.categoryValue} value={cat.categoryValue}>
                    {cat.category} ({cat.categoryValue})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'السعر الأساسي' : 'Base Price'} *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className={styles.input}
                required
                min={0}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'السعر بعد الخصم' : 'Discounted Price'}</label>
              <input
                type="number"
                value={formData.priceAfterDiscount}
                onChange={(e) => setFormData({ ...formData, priceAfterDiscount: Number(e.target.value) })}
                className={styles.input}
                min={0}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'الوصف القصير (عربي)' : 'Short Description (Arabic)'}</label>
              <input
                type="text"
                value={formData.shortDescriptionAr}
                onChange={(e) => setFormData({ ...formData, shortDescriptionAr: e.target.value })}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{language === 'ar' ? 'الوصف القصير (إنجليزي)' : 'Short Description (English)'}</label>
              <input
                type="text"
                value={formData.shortDescriptionEn}
                onChange={(e) => setFormData({ ...formData, shortDescriptionEn: e.target.value })}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {language === 'ar' ? 'المواصفات والتفاصيل (عربي - سطر لكل نقطة)' : 'Specifications (Arabic)'}
              </label>
              <textarea
                value={formData.fullDescriptionAr}
                onChange={(e) => setFormData({ ...formData, fullDescriptionAr: e.target.value })}
                className={styles.textarea}
                rows={3}
                placeholder="خشب زان طبيعي معالج&#10;أقمشة كتان بلجيكي مقاوم للبقع&#10;ضمان شامل 5 سنوات"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {language === 'ar' ? 'المواصفات والتفاصيل (إنجليزي - سطر لكل نقطة)' : 'Specifications (English)'}
              </label>
              <textarea
                value={formData.fullDescriptionEn}
                onChange={(e) => setFormData({ ...formData, fullDescriptionEn: e.target.value })}
                className={styles.textarea}
                rows={3}
                placeholder="Solid beech wood construction&#10;Stain-resistant Belgian linen&#10;5-year structural warranty"
              />
            </div>
          </div>

          {/* Color Manager */}
          <div className={styles.sectionBox}>
            <h4 className={styles.sectionBoxTitle}>{language === 'ar' ? 'الألوان المتاحة' : 'Available Colors'}</h4>
            <div className={styles.colorChipsRow}>
              {formData.colors.map((c, i) => (
                <span key={i} className={styles.colorChipBadge}>
                  <span>{c.nameAr} ({c.nameEn})</span>
                  <button type="button" onClick={() => handleRemoveColor(i)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className={styles.inlineInputs}>
              <input
                type="text"
                placeholder={language === 'ar' ? 'اسم اللون بالعربي' : 'Color (Arabic)'}
                value={tempColorAr}
                onChange={(e) => setTempColorAr(e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder={language === 'ar' ? 'اسم اللون بالإنجليزي' : 'Color (English)'}
                value={tempColorEn}
                onChange={(e) => setTempColorEn(e.target.value)}
                className={styles.input}
              />
              <button type="button" onClick={handleAddColor} className={styles.addMiniBtn}>
                <Plus size={16} />
                <span>{language === 'ar' ? 'إضافة لون' : 'Add Color'}</span>
              </button>
            </div>
          </div>

          {/* Variants Manager */}
          <div className={styles.sectionBox}>
            <h4 className={styles.sectionBoxTitle}>
              {language === 'ar' ? 'المقاسات والأنواع (Variants)' : 'Sizes & Types (Variants)'}
            </h4>
            <div className={styles.variantsList}>
              {formData.variants.map((v, i) => (
                <div key={i} className={styles.variantItem}>
                  <span>{v.sizeAr} ({v.sizeEn}) - {v.typeAr} ({v.typeEn})</span>
                  <strong>{v.priceAfterDiscount || v.price} {t('currency')}</strong>
                  <button type="button" onClick={() => handleRemoveVariant(i)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.variantInputsGrid}>
              <input
                type="text"
                placeholder={language === 'ar' ? 'المقاس عربي (مثال: 200×180)' : 'Size (AR)'}
                value={tempVariant.sizeAr}
                onChange={(e) => setTempVariant({ ...tempVariant, sizeAr: e.target.value })}
                className={styles.input}
              />
              <input
                type="text"
                placeholder={language === 'ar' ? 'المقاس إنجليزي' : 'Size (EN)'}
                value={tempVariant.sizeEn}
                onChange={(e) => setTempVariant({ ...tempVariant, sizeEn: e.target.value })}
                className={styles.input}
              />
              <input
                type="text"
                placeholder={language === 'ar' ? 'النوع عربي (مثال: خشب بلوط)' : 'Type (AR)'}
                value={tempVariant.typeAr}
                onChange={(e) => setTempVariant({ ...tempVariant, typeAr: e.target.value })}
                className={styles.input}
              />
              <input
                type="text"
                placeholder={language === 'ar' ? 'النوع إنجليزي' : 'Type (EN)'}
                value={tempVariant.typeEn}
                onChange={(e) => setTempVariant({ ...tempVariant, typeEn: e.target.value })}
                className={styles.input}
              />
              <input
                type="number"
                placeholder={language === 'ar' ? 'السعر' : 'Price'}
                value={tempVariant.price || ''}
                onChange={(e) => setTempVariant({ ...tempVariant, price: Number(e.target.value) })}
                className={styles.input}
              />
              <button type="button" onClick={handleAddVariant} className={styles.addMiniBtn}>
                <Plus size={16} />
                <span>{language === 'ar' ? 'إضافة خيار' : 'Add Variant'}</span>
              </button>
            </div>
          </div>

          {/* Image Files Upload */}
          <div className={styles.sectionBox}>
            <h4 className={styles.sectionBoxTitle}>
              <ImageIcon size={18} />
              <span>{language === 'ar' ? 'صور المنتج' : 'Product Images'}</span>
            </h4>

            {/* Existing Images (Edit mode) */}
            {isEditMode && existingImages.length > 0 && (
              <div>
                <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>
                  {language === 'ar' ? 'الصور الحالية (انقر على الحذف لإزالة الصورة):' : 'Current Images (Click X to remove):'}
                </label>
                <div className={styles.imageGalleryGrid}>
                  {existingImages.map((img) => (
                    <div key={img.id} className={styles.imageThumbCard}>
                      <img src={getImageUrl(img.path)} alt="Product" />
                      <button
                        type="button"
                        className={styles.deleteImgOverlay}
                        onClick={() => handleRemoveExistingImage(img.id)}
                        title={language === 'ar' ? 'حذف هذه الصورة' : 'Delete image'}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected New Images Preview */}
            {selectedImageFiles.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>
                  {language === 'ar' ? 'الصور الجديدة المحددة للرفع:' : 'New Selected Images:'}
                </label>
                <div className={styles.imageGalleryGrid}>
                  {selectedImageFiles.map((file, idx) => (
                    <div key={idx} className={styles.imageThumbCard}>
                      <img src={URL.createObjectURL(file)} alt="Preview" />
                      <button
                        type="button"
                        className={styles.deleteImgOverlay}
                        onClick={() => setSelectedImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                        title="Remove file"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  const newFiles = Array.from(e.target.files);
                  setSelectedImageFiles((prev) => [...prev, ...newFiles]);
                }
              }}
              className={styles.fileInput}
            />
            {selectedImageFiles.length > 0 && (
              <p className={styles.filesSelectedCount}>
                {language === 'ar'
                  ? `تم تحديد ${selectedImageFiles.length} صور جديدة للرفع`
                  : `${selectedImageFiles.length} new images queued for upload`}
              </p>
            )}
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
              {t('cancel')}
            </button>
            <button type="submit" disabled={isSaving} className={styles.saveSubmitBtn}>
              <Check size={16} />
              <span>{isSaving ? t('loading') : t('saveChanges')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t('confirmDeleteTitle')}
        maxWidth="sm"
      >
        <div className={styles.deleteConfirmBody}>
          <p>{t('confirmDeleteText')}</p>
          <p className={styles.deleteTargetName}>"{productToDelete?.name}"</p>
          <div className={styles.deleteModalActions}>
            <button onClick={() => setDeleteModalOpen(false)} className={styles.cancelBtn}>
              {t('cancel')}
            </button>
            <button onClick={confirmDelete} className={styles.deleteConfirmBtn}>
              {t('yesDelete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
