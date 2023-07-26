import { useCallback, useState } from 'react'

import { type ErrorInfo } from '../components/BackendError';
import { getRSForms } from '../utils/backendAPI';
import { IRSFormMeta } from '../utils/models'

export enum FilterType {
  PERSONAL = 'personal',
  COMMON = 'common'
}

export interface RSFormsFilter {
  type: FilterType
  data?: number | null
}

export function useRSForms() {
  const [rsforms, setRSForms] = useState<IRSFormMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const loadList = useCallback((filter: RSFormsFilter) => {
    getRSForms(filter, {
      showError: true,
      setLoading,
      onError: error => { setError(error); },
      onSuccess: newData => { setRSForms(newData); }
    });
  }, []);

  return { rsforms, error, loading, loadList };
}
