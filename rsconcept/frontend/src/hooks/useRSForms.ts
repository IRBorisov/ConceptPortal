import axios from 'axios'
import { useEffect, useState } from 'react'
import { IRSForm } from '../models'
import { config } from '../constants'
import { ErrorInfo } from '../components/BackendError';

export function useRSForms() {
  const [rsforms, setRSForms] = useState<IRSForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);
  
  async function fetchRSForms() {
    setError(undefined);
    setLoading(true);
    console.log('RSForms requested');
    axios.get<IRSForm[]>(`${config.url.BASE}rsforms/`)
    .then(function (response) {
      setLoading(false);
      setRSForms(response.data);
    })
    .catch(function (error) {
      setLoading(false);
      setError(error);
    });
  }

  useEffect(() => {
    fetchRSForms();
  }, [])

  return { rsforms, error, loading };
}