import type { ComponentType } from 'react';

import { usePreferencesStore } from '@/stores/preferences';

/** Renders one of three topic variants by saved UI locale. Pass `forwardProps` when variants expect props. */
export function HelpTopicByLocale<P extends object = Record<string, never>>(props: {
  ru: ComponentType<P>;
  en: ComponentType<P>;
  fr: ComponentType<P>;
  forwardProps?: P;
}) {
  const locale = usePreferencesStore(state => state.locale);
  const pass = props.forwardProps ?? ({} as P);
  if (locale === 'en') {
    const En = props.en;
    return <En {...pass} />;
  }
  if (locale === 'fr') {
    const Fr = props.fr;
    return <Fr {...pass} />;
  }
  const Ru = props.ru;
  return <Ru {...pass} />;
}
