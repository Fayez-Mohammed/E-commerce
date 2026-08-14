import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/services/api';
import styles from './Auth.module.css';

export const ConfirmEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const { t, language } = useLanguageStore();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage(language === 'ar' ? 'معلمات رابط التأكيد غير صالحة.' : 'Invalid confirmation link parameters.');
      return;
    }

    authService
      .confirmEmail(token, email)
      .then((res) => {
        setStatus('success');
        setMessage(res || t('emailConfirmedSuccess'));
      })
      .catch((err) => {
        setStatus('error');
        setMessage(getErrorMessage(err, language === 'ar' ? 'فشل تأكيد البريد الإلكتروني أو الرمز غير صالح.' : 'Verification failed or token expired.'));
      });
  }, [token, email, language]);

  return (
    <div className={`container ${styles.authContainer}`}>
      <div className={styles.authCard}>
        {status === 'verifying' && (
          <div className={styles.verifyingState}>
            <div className={styles.spinner} />
            <h2 className={styles.authTitle}>
              {language === 'ar' ? 'جاري تأكيد بريدك الإلكتروني...' : 'Verifying your email address...'}
            </h2>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.successState}>
            <CheckCircle2 size={64} className={styles.successIcon} />
            <h2 className={styles.authTitle}>{language === 'ar' ? 'تم تأكيد الحساب بنجاح!' : 'Email Verified!'}</h2>
            <p className={styles.successText}>{message}</p>
            <Link to="/login" className={styles.submitBtn}>
              <LogIn size={18} />
              <span>{t('login')}</span>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.successState}>
            <AlertCircle size={64} className={styles.errorIcon} />
            <h2 className={styles.authTitle}>{language === 'ar' ? 'خطأ في التأكيد' : 'Verification Error'}</h2>
            <p className={styles.errorText}>{message}</p>
            <Link to="/login" className={styles.secondaryBtn}>
              <span>{t('login')}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
