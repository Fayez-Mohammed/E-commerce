import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle2, Clock } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { contactService } from '@/services/contactService';
import { getErrorMessage } from '@/services/api';
import styles from './ContactPage.module.css';

export const ContactPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phoneNumber.trim() || !formData.message.trim()) {
      toastError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، الهاتف، والرسالة)' : 'Please fill all required fields (Name, Email, Phone, and Message)');
      return;
    }

    setIsSubmitting(true);
    try {
      await contactService.submitForm(formData);
      setIsSubmitted(true);
      success(t('messageSentSuccess'));
      setFormData({ name: '', email: '', phoneNumber: '', address: '', message: '' });
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`container ${styles.contactPage}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('contactUs')}</h1>
        <p className={styles.subtitle}>{t('contactSubtitle')}</p>
      </div>

      <div className={styles.contactGrid}>
        {/* Contact Information & Showroom */}
        <div className={styles.infoSide}>
          <h2 className={styles.infoHeading}>
            {language === 'ar' ? 'معرضنا وفريق الاستشارات' : 'Showroom & Design Consultation'}
          </h2>
          <p className={styles.infoText}>
            {language === 'ar'
              ? 'تفضل بزيارة صالة العرض الخاصة بنا لاستكشاف الخامات والأقمشة الطبيعية، أو تواصل مع مستشاري التصميم الداخلي لدينا.'
              : 'Visit our flagship showroom to experience our textures firsthand, or consult with our interior design specialists.'}
          </p>

          <div className={styles.cardsList}>
            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>
                <MapPin size={22} />
              </div>
              <div>
                <h4 className={styles.cardTitle}>{t('ourLocation')}</h4>
                <p className={styles.cardDetail}>
                  {language === 'ar' ? 'القاهرة، جمهورية مصر العربية' : 'Cairo, Egypt'}
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>
                <Phone size={22} />
              </div>
              <div>
                <h4 className={styles.cardTitle}>{t('ourPhone')}</h4>
                <p className={styles.cardDetail}>
                  <a href="tel:01027016323" style={{ color: 'inherit' }}>01027016323</a>
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>
                <Mail size={22} />
              </div>
              <div>
                <h4 className={styles.cardTitle}>{t('ourEmail')}</h4>
                <p className={styles.cardDetail}>
                  <a href="mailto:fayez00mohammed@gmail.com" style={{ color: 'inherit' }}>fayez00mohammed@gmail.com</a>
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>
                <Clock size={22} />
              </div>
              <div>
                <h4 className={styles.cardTitle}>{language === 'ar' ? 'ساعات العمل' : 'Working Hours'}</h4>
                <p className={styles.cardDetail}>
                  {language === 'ar' ? 'السبت - الخميس: 9:00 ص - 10:00 م' : 'Sat - Thu: 9:00 AM - 10:00 PM'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className={styles.formSide}>
          {isSubmitted ? (
            <div className={styles.submittedBox}>
              <CheckCircle2 size={54} className={styles.checkIcon} />
              <h3>{t('messageSentSuccess')}</h3>
              <p>
                {language === 'ar'
                  ? 'تم استلام استفسارك بنجاح وسيقوم فريق الاستشارات بالتواصل معك خلال 24 ساعة.'
                  : 'We have received your message and will get back to you within 24 hours.'}
              </p>
              <button className={styles.sendAnotherBtn} onClick={() => setIsSubmitted(false)}>
                {language === 'ar' ? 'إرسال رسالة أخرى' : 'Send another inquiry'}
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <h3 className={styles.formTitle}>{language === 'ar' ? 'أرسل لنا استفسارك' : 'Send an Inquiry'}</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('fullName')} *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('fullNamePlaceholder')}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('email')} *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@domain.com"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('phone')} *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder={t('phonePlaceholder')}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{language === 'ar' ? 'العنوان / المدينة' : 'Address / City'}</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={language === 'ar' ? 'مثال: القاهرة، التجمع الخامس' : 'e.g. Cairo, New Cairo'}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('message')} *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={language === 'ar' ? 'اكتب تفاصيل طلبك أو استفسارك هنا...' : 'How can our design consultants assist you?'}
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </div>

              <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                <Send size={16} />
                <span>{isSubmitting ? t('loading') : t('sendMessage')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
