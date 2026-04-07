'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { type SandboxBundle } from '../models/bundle';
import { ensureBundleLoaded, saveBundle } from '../stores/sandbox-repository';

interface UseSandboxBundleResult {
  bundle: SandboxBundle | null;
  setBundle: React.Dispatch<React.SetStateAction<SandboxBundle | null>>;
  isLoading: boolean;
  error: Error | null;
}

export function useSandboxBundle(): UseSandboxBundleResult {
  const [bundle, setBundle] = useState<SandboxBundle | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(function loadSandboxBundle() {
    let isActive = true;

    void ensureBundleLoaded()
      .then(function handleLoaded(next) {
        if (!isActive) {
          return;
        }
        setBundle(next);
        setIsLoaded(true);
      })
      .catch(function handleError(err: unknown) {
        if (!isActive) {
          return;
        }
        setError(err instanceof Error ? err : new Error('Failed to load sandbox bundle'));
        toast.error('Failed to load sandbox bundle');
        setIsLoaded(true);
      });

    return function cancelLoad() {
      isActive = false;
    };
  }, []);

  useEffect(function persistSandboxBundle() {
    if (!isLoaded || !bundle) {
      return;
    }
    void saveBundle(bundle).catch(function handlePersistError(err: unknown) {
      setError(err instanceof Error ? err : new Error('Failed to persist sandbox bundle'));
      toast.error('Failed to persist sandbox bundle');
    });
  }, [bundle, isLoaded]);

  return {
    bundle,
    setBundle,
    isLoading: !isLoaded && bundle === null && error === null,
    error
  };
}
