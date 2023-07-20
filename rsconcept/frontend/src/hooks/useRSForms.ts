import { useCallback, useState } from 'react'
import { IRSForm } from '../utils/models'
import { ErrorInfo } from '../components/BackendError';
import { getRSForms } from '../utils/backendAPI';

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
    getRSForms(filter, {
      showError: true,
      setLoading: setLoading,
      onError: error => setError(error),
      onSucccess: response => setRSForms(response.data)
    });
  }, []);

  return { rsforms, error, loading, loadList };
}