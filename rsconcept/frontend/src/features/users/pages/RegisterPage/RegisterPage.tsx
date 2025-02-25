import { useAuthSuspense } from '@/features/auth';
import { ExpectedAnonymous } from '@/features/auth/components';

import { FormSignup } from './FormSignup';

export function RegisterPage() {
  const { isAnonymous } = useAuthSuspense();

  if (!isAnonymous) {
    return <ExpectedAnonymous />;
  } else {
    return <FormSignup />;
  }
}
