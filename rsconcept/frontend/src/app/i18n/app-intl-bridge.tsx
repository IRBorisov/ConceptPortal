'use client';

import { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { setAppIntl } from '@/app/i18n/format-app-message';

/** Keeps `formatAppMessage` / `formatLabel` in sync with the active UI locale. */
export function AppIntlBridge() {
  const intl = useIntl();
  useEffect(
    function bindIntl() {
      setAppIntl(intl);
      return function unbindIntl() {
        setAppIntl(null);
      };
    },
    [intl]
  );
  return null;
}
