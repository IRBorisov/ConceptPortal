import { useAuthSuspense } from '@/backend/auth/useAuth';
import ExpectedAnonymous from '@/components/ExpectedAnonymous';

import FormSignup from './FormSignup';

function RegisterPage() {
  const { user } = useAuthSuspense();

  if (user) {
    return <ExpectedAnonymous />;
  } else {
    return <FormSignup />;
  }
}

export default RegisterPage;
