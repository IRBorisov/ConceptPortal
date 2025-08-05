'use client';

import { ToastContainer, type ToastContainerProps } from 'react-toastify';

import { usePreferencesStore } from '@/stores/preferences';

interface ToasterThemedProps extends Omit<ToastContainerProps, 'theme'> {}

export function ToasterThemed(props: ToasterThemedProps) {
  const darkMode = usePreferencesStore(state => state.darkMode);
  return <ToastContainer theme={darkMode ? 'dark' : 'light'} {...props} />;
}
