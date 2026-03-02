import { useAuth } from '@/features/auth';
import { ExpectedAnonymous } from '@/features/auth/components/expected-anonymous';

import { FormSignup } from './form-signup';

export function RegisterPage() {
  const { isAnonymous } = useAuth();

  if (!isAnonymous) {
    return <ExpectedAnonymous />;
  } else {
    return <FormSignup />;
  }
}
