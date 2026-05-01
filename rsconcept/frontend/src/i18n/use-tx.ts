import { useIntl } from 'react-intl';

type TxValues = Record<string, string | number | boolean | Date | null | undefined>;

/**
 * Compact UI strings: English `defaultMessage` in source; `fr`/`ru` in message catalogs.
 */
export function useTx() {
  const intl = useIntl();
  return function tx(id: string, defaultMessage: string, values?: TxValues): string {
    return intl.formatMessage({ id, defaultMessage }, values);
  };
}
