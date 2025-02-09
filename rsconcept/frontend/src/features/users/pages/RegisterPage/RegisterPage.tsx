import { useAuthSuspense } from '@/features/auth/backend/useAuth';
import ExpectedAnonymous from '@/features/auth/components/ExpectedAnonymous';

import FormSignup from './FormSignup';

export function RegisterPage() {
  const { isAnonymous } = useAuthSuspense();

  if (!isAnonymous) {
    return <ExpectedAnonymous />;
  } else {
    return <FormSignup />;
  }
}
