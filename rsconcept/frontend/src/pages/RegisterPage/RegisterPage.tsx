import { useAuthSuspense } from '@/backend/auth/useAuth';
import ExpectedAnonymous from '@/components/ExpectedAnonymous';

import FormSignup from './FormSignup';

export function RegisterPage() {
  const { isAnonymous } = useAuthSuspense();

  if (!isAnonymous) {
    return <ExpectedAnonymous />;
  } else {
    return <FormSignup />;
  }
}
