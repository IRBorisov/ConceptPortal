import { ExpectedAnonymous, useAuthSuspense } from '@/features/auth';

import FormSignup from './FormSignup';

export function RegisterPage() {
  const { isAnonymous } = useAuthSuspense();

  if (!isAnonymous) {
    return <ExpectedAnonymous />;
  } else {
    return <FormSignup />;
  }
}
