import { useCallback, useState } from 'react'

import { type ErrorInfo } from '../components/BackendError';
import { getRSForms } from '../utils/backendAPI';
import { type IRSForm } from '../utils/models'

export enum FilterType {
  PERSONAL = 'personal',
  COMMON = 'common'
}

export interface RSFormsFilter {
  type: FilterType
  data?: any
}

export function useRSForms() {
  const [rsforms, setRSForms] = useState<IRSForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const loadList = useCallback(async (filter: RSFormsFilter) => {
    await getRSForms(filter, {
      showError: true,
      setLoading,
      onError: error => { setError(error); },
      onSucccess: response => { setRSForms(response.data); }
    });
  }, []);

  return { rsforms, error, loading, loadList };
}
