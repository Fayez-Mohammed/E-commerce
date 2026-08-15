import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useToast } from '@/components/common/Toast';
import { PasswordInput } from '@/components/common/PasswordInput';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/services/api';
import styles from './ProfilePage.module.css';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, updateUser, fetchCurrentUser } = useAuthStore();
  const { t, language } = useLanguageStore();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/profile');
      return;
    }
    fetchCurrentUser().then((u) => {
      if (u) {
        setProfileData({
          name: u.name || '',
          phoneNumber: u.phoneNumber || '',
        });
      }
    });
  }, [isAuthenticated]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setIsUpdatingProfile(true);
    try {
      const res = await authService.updateUserInfo({
        email: user.email,
        name: profileData.name.trim(),
        phoneNumber: profileData.phoneNumber.trim(),
      });
      updateUser({
        name: profileData.name.trim(),
        phoneNumber: profileData.phoneNumber.trim(),
      });
      success(res || t('profileUpdated'));
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'فشل تحديث البيانات' : 'Failed to update profile'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toastError(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authService.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmNewPassword
      );
      success(res || t('passwordChanged'));
      setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toastError(getErrorMessage(err, language === 'ar' ? 'كلمة المرور الحالية غير صحيحة' : 'Failed to change password'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className={`container ${styles.profilePage}`}>
      <div className={styles.header}>
        <div className={styles.avatarLarge}>
          {user?.name ? user.name.charAt(0).toUpperCase() : <User size={32} />}
        </div>
        <div>
          <h1 className={styles.userName}>{user?.name}</h1>
          <p className={styles.userEmail}>{user?.email}</p>
        </div>
      </div>

      <div className={styles.profileGrid}>
        {/* Personal Details Form */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <User size={20} className={styles.titleIcon} />
            <span>{t('updateProfile')}</span>
          </h2>

          <form className={styles.form} onSubmit={handleProfileSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('email')}</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={`${styles.input} ${styles.disabled}`}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('name')}</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder={t('fullNamePlaceholder')}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('phone')}</label>
              <div className={styles.inputWrapper}>
                <Phone size={18} className={styles.inputIcon} />
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                  placeholder={t('phonePlaceholder')}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isUpdatingProfile} className={styles.saveBtn}>
              <Save size={16} />
              <span>{isUpdatingProfile ? t('loading') : t('saveChanges')}</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Lock size={20} className={styles.titleIcon} />
            <span>{t('changePassword')}</span>
          </h2>

          <form className={styles.form} onSubmit={handlePasswordSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('oldPassword')}</label>
              <PasswordInput
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                placeholder="••••••••"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('newPassword')}</label>
              <PasswordInput
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••"
                className={styles.input}
                required
                minLength={6}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('confirmPassword')}</label>
              <PasswordInput
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                placeholder="••••••••"
                className={styles.input}
                required
                minLength={6}
              />
            </div>

            <button type="submit" disabled={isChangingPassword} className={styles.saveBtn}>
              <Lock size={16} />
              <span>{isChangingPassword ? t('loading') : t('changePassword')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
