import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, CheckCircle2, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { PasswordInput } from '@/components/common/PasswordInput';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/services/api';
import styles from './Auth.module.css';

export const ForgotPasswordPage: React.FC = () => {
  const { t, language, direction } = useLanguageStore();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const isRtl = direction === 'rtl';

  const [step, setStep] = useState<'email' | 'otp' | 'newPassword' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      success(res || (language === 'ar' ? 'تم إرسال رمز OTP إلى بريدك الإلكتروني' : 'OTP sent to your email'));
      setStep('otp');
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل إرسال رمز التحقق' : 'Failed to send OTP'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toastError(language === 'ar' ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام' : 'Please enter 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyOtp(email.trim(), otp.trim());
      setResetToken(res.resetToken);
      success(res.message || (language === 'ar' ? 'تم التحقق من الرمز بنجاح' : 'OTP verified'));
      setStep('newPassword');
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'رمز OTP غير صالح أو منتهي الصلاحية' : 'Invalid or expired OTP'));
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const res = await authService.resendOtp(email.trim());
      success(res || (language === 'ar' ? 'تمت إعادة إرسال رمز التحقق' : 'OTP resent'));
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل إعادة الإرسال' : 'Failed to resend OTP'));
    } finally {
      setIsResending(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toastError(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword(
        email.trim(),
        resetToken,
        newPassword,
        confirmNewPassword
      );
      success(res || (language === 'ar' ? 'تم تعيين كلمة المرور الجديدة بنجاح' : 'Password updated successfully'));
      setStep('done');
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل تعيين كلمة المرور' : 'Failed to reset password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container ${styles.authContainer}`}>
      <div className={styles.authCard}>
        {/* Step 1: Email Form */}
        {step === 'email' && (
          <>
            <div className={styles.authHeader}>
              <div className={styles.logoBadge}>
                <KeyRound size={22} />
              </div>
              <h1 className={styles.authTitle}>{t('resetPasswordTitle')}</h1>
              <p className={styles.authSubtitle}>{t('resetPasswordDesc')}</p>
            </div>

            <form className={styles.authForm} onSubmit={handleSendOtp}>
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

              <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                <span>{isLoading ? t('loading') : t('sendOtp')}</span>
                {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </button>
            </form>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <>
            <div className={styles.authHeader}>
              <div className={styles.logoBadge}>
                <KeyRound size={22} />
              </div>
              <h1 className={styles.authTitle}>{t('enterOtp')}</h1>
              <p className={styles.authSubtitle}>
                {language === 'ar'
                  ? `أدخل رمز التحقق المرسل إلى: ${email}`
                  : `Enter the 6-digit code sent to ${email}`}
              </p>
            </div>

            <form className={styles.authForm} onSubmit={handleVerifyOtp}>
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <KeyRound size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className={`${styles.authInput} ${styles.otpInput}`}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                <span>{isLoading ? t('loading') : t('verifyOtp')}</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className={styles.resendBtn}
              >
                <RefreshCw size={14} className={isResending ? styles.spin : ''} />
                <span>{t('resendOtp')}</span>
              </button>
            </form>
          </>
        )}

        {/* Step 3: Set New Password */}
        {step === 'newPassword' && (
          <>
            <div className={styles.authHeader}>
              <div className={styles.logoBadge}>
                <Lock size={22} />
              </div>
              <h1 className={styles.authTitle}>{t('setNewPassword')}</h1>
              <p className={styles.authSubtitle}>
                {language === 'ar' ? 'أدخل كلمة مرور قوية وجديدة لحسابك' : 'Choose a strong new password for your account'}
              </p>
            </div>

            <form className={styles.authForm} onSubmit={handleResetPassword}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('newPassword')}</label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={styles.authInput}
                  required
                  minLength={6}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('confirmPassword')}</label>
                <PasswordInput
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={styles.authInput}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                <span>{isLoading ? t('loading') : t('saveNewPassword')}</span>
              </button>
            </form>
          </>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <div className={styles.successState}>
            <CheckCircle2 size={64} className={styles.successIcon} />
            <h2 className={styles.authTitle}>{language === 'ar' ? 'تم تعيين كلمة المرور!' : 'Password Reset Complete!'}</h2>
            <p className={styles.successText}>
              {language === 'ar'
                ? 'يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.'
                : 'You may now sign in using your new password.'}
            </p>
            <Link to="/login" className={styles.submitBtn}>
              <span>{t('login')}</span>
            </Link>
          </div>
        )}

        <div className={styles.authFooter}>
          <Link to="/login" className={styles.backToLogin}>
            {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            <span>{language === 'ar' ? 'الرجوع إلى تسجيل الدخول' : 'Back to sign in'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
