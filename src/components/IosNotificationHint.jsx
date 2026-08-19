import React from 'react';
import { useLang } from '../hooks/useLangHook';
import { isIosSafariBrowser } from '../utils/isIosSafari';
import './IosNotificationHint.css';

export default function IosNotificationHint({ className = '' }) {
  const { t } = useLang();

  if (!isIosSafariBrowser()) return null;

  return (
    <p className={`notify-ios-hint ${className}`.trim()} role="note">
      <strong>{t('notify_ios_hint_label')}</strong> {t('notify_ios_hint')}
    </p>
  );
}
