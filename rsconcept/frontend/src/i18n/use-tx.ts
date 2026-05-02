import { useIntl } from 'react-intl';

type TxValues = Record<string, string | number | boolean | Date | null | undefined>;

/**
 * Compact UI strings: copy for `locale` lives in `messages/partials/*.en.ts` / `*.ru.ts` / `*.fr.ts` (same ids).
 */
export function useTx() {
  const intl = useIntl();
  return function tx(id: string, values?: TxValues): string {
    return intl.formatMessage({ id }, values);
  };
}
