import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import styles from './PasswordInput.module.css';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  showLockIcon?: boolean;
  wrapperClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      icon,
      showLockIcon = true,
      wrapperClassName = '',
      className = '',
      placeholder = '••••••••',
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const { language } = useLanguageStore();

    const ariaLabel = showPassword
      ? language === 'ar'
        ? 'إخفاء كلمة المرور'
        : 'Hide password'
      : language === 'ar'
      ? 'إظهار كلمة المرور'
      : 'Show password';

    const hasStartIcon = showLockIcon || icon !== undefined;

    return (
      <div className={`${styles.wrapper} ${wrapperClassName}`}>
        {hasStartIcon && (
          <div className={styles.inputIcon}>
            {icon || <Lock size={18} />}
          </div>
        )}

        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className={`${className} ${hasStartIcon ? styles.inputWithIcon : styles.inputWithoutIcon}`}
          {...rest}
        />

        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={ariaLabel}
          title={ariaLabel}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
