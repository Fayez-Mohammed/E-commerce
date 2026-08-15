import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Phone, UserPlus, CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { PasswordInput } from '@/components/common/PasswordInput';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/services/api';
import styles from './Auth.module.css';

export const RegisterPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toastError(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.register({
        displayName: formData.displayName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
      });

      setIsSuccess(true);
      setSuccessMessage(res || t('emailVerifyPrompt'));
      success(t('emailVerifyPrompt'));
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`container ${styles.authContainer}`}>
        <div className={styles.authCard}>
          <div className={styles.successState}>
            <CheckCircle2 size={64} className={styles.successIcon} />
            <h2 className={styles.authTitle}>{language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account Created!'}</h2>
            <p className={styles.successText}>{successMessage}</p>
            <Link to="/login" className={styles.submitBtn}>
              <span>{t('login')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.authContainer}`}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logoBadge}>
            <span>W</span>
          </div>
          <h1 className={styles.authTitle}>{t('createAccount')}</h1>
          <p className={styles.authSubtitle}>{t('registerSubtitle')}</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('name')} *</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder={t('fullNamePlaceholder')}
                className={styles.authInput}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('email')} *</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={styles.authInput}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('phone')} *</label>
            <div className={styles.inputWrapper}>
              <Phone size={18} className={styles.inputIcon} />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder={t('phonePlaceholder')}
                className={styles.authInput}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('password')} *</label>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={styles.authInput}
              required
              minLength={6}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('confirmPassword')} *</label>
            <PasswordInput
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={styles.authInput}
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={isLoading} className={styles.submitBtn}>
            <UserPlus size={18} />
            <span>{isLoading ? t('loading') : t('createAccount')}</span>
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            {t('haveAccount')}{' '}
            <Link to="/login" className={styles.switchLink}>
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
