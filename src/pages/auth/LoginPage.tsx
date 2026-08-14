import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/services/api';
import styles from './Auth.module.css';

export const LoginPage: React.FC = () => {
  const { setAuth } = useAuthStore();
  const { items: guestCartItems, fetchCart } = useCartStore();
  const { productIds: guestWishlistIds, fetchWishlist } = useWishlistStore();
  const { t, language, direction } = useLanguageStore();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const isRtl = direction === 'rtl';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    try {
      const res = await authService.login({
        email: email.trim(),
        password: password.trim(),
        guestItems: guestCartItems.length > 0 ? guestCartItems : undefined,
        guestWishlistIds: guestWishlistIds.length > 0 ? guestWishlistIds : undefined,
      });

      await setAuth(res.token, res.email);
      await Promise.all([fetchCart(), fetchWishlist()]);

      success(language === 'ar' ? 'تم تسجيل الدخول بنجاح! مرحباً بك' : 'Signed in successfully! Welcome back.');
      navigate(redirectUrl);
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container ${styles.authContainer}`}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logoBadge}>
            <span>W</span>
          </div>
          <h1 className={styles.authTitle}>{t('welcomeBack')}</h1>
          <p className={styles.authSubtitle}>{t('loginSubtitle')}</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('email')}</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={styles.authInput}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label}>{t('password')}</label>
              <Link to="/forgot-password" className={styles.forgotLink}>
                {t('forgotPassword')}
              </Link>
            </div>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.authInput}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={styles.submitBtn}>
            <LogIn size={18} />
            <span>{isLoading ? t('loading') : t('login')}</span>
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className={styles.switchLink}>
              {t('createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
