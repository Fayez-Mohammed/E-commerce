import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, LogIn, ArrowRight, ArrowLeft, RefreshCw, UserPlus } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/services/api';
import styles from './Auth.module.css';

export const ConfirmEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const { t, language, direction } = useLanguageStore();
  const isRtl = direction === 'rtl';

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  // Prevent multiple executions for the same token/email
  const hasExecutedRef = useRef(false);

  const verifyEmail = async () => {
    if (!token || !email) {
      setStatus('error');
      setMessage(
        language === 'ar'
          ? 'معلمات رابط التأكيد غير مكتملة أو غير صالحة. يرجى التأكد من الضغط على الرابط الكامل المرسل لبريدك الإلكتروني.'
          : 'Confirmation link parameters are missing or invalid. Please click the full link in your confirmation email.'
      );
      return;
    }

    setStatus('verifying');
    setMessage('');

    try {
      const res = await authService.confirmEmail(token, email);
      setStatus('success');
      setMessage(
        res ||
          (language === 'ar'
            ? 'تم تأكيد بريدك الإلكتروني بنجاح! حسابك الآن نشط وجاهز للاستخدام.'
            : 'Your email has been verified successfully! Your account is active and ready.')
      );
    } catch (err: any) {
      setStatus('error');
      const errDetail = getErrorMessage(
        err,
        language === 'ar'
          ? 'فشل تأكيد البريد الإلكتروني. قد يكون الرمز منتهي الصلاحية أو تم استخدامه مسبقاً.'
          : 'Verification failed. The confirmation link may be expired or already used.'
      );
      setMessage(errDetail);
    }
  };

  useEffect(() => {
    if (!hasExecutedRef.current) {
      hasExecutedRef.current = true;
      verifyEmail();
    }
  }, [token, email, attemptCount]);

  const handleRetry = () => {
    hasExecutedRef.current = false;
    setAttemptCount((prev) => prev + 1);
  };

  return (
    <div className={`container ${styles.authContainer}`}>
      <div className={styles.authCard}>
        {/* Brand Logo Badge */}
        <div className={styles.authHeader}>
          <div className={styles.logoBadge}>
            <span>W</span>
          </div>
        </div>

        {/* 1. Verifying / Loading State */}
        {status === 'verifying' && (
          <div className={styles.verifyingState}>
            <div className={styles.spinner} />
            <h2 className={styles.authTitle}>
              {language === 'ar' ? 'جاري التحقق من بريدك الإلكتروني...' : 'Verifying your email address...'}
            </h2>
            <p className={styles.authSubtitle}>
              {language === 'ar'
                ? 'يرجى الانتظار لحظات بينما نقوم بتأكيد حسابك وتفعيله.'
                : 'Please wait a moment while we verify your credentials and activate your account.'}
            </p>
            {email && (
              <span className={styles.userEmailPill}>
                {email}
              </span>
            )}
          </div>
        )}

        {/* 2. Success State */}
        {status === 'success' && (
          <div className={styles.successState}>
            <CheckCircle2 size={60} className={styles.successIcon} />
            <h2 className={styles.authTitle}>
              {language === 'ar' ? 'تم تأكيد الحساب بنجاح!' : 'Email Verified Successfully!'}
            </h2>
            <p className={styles.successText}>{message}</p>
            {email && (
              <span className={styles.userEmailPill}>
                {email}
              </span>
            )}

            <Link to="/login" className={styles.submitBtn}>
              <LogIn size={18} />
              <span>{language === 'ar' ? 'تسجيل الدخول إلى حسابك' : 'Login to Your Account'}</span>
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </div>
        )}

        {/* 3. Error / Expired State */}
        {status === 'error' && (
          <div className={styles.successState}>
            <AlertCircle size={60} className={styles.errorIcon} />
            <h2 className={styles.authTitle}>
              {language === 'ar' ? 'تعذر تأكيد البريد الإلكتروني' : 'Verification Unsuccessful'}
            </h2>
            <p className={styles.errorText}>{message}</p>

            <div className={styles.errorActions}>
              <Link to="/login" className={styles.submitBtn}>
                <LogIn size={18} />
                <span>{language === 'ar' ? 'تسجيل الدخول' : 'Go to Login'}</span>
              </Link>

              <button type="button" onClick={handleRetry} className={styles.secondaryBtn}>
                <RefreshCw size={16} />
                <span>{language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}</span>
              </button>

              <Link to="/register" className={styles.registerLink}>
                <UserPlus size={16} />
                <span>{language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
