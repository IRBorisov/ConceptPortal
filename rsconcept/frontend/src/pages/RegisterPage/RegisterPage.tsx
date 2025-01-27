import { useAuth } from '@/backend/auth/useAuth';
import Loader from '@/components/ui/Loader';
import ExpectedAnonymous from '@/components/wrap/ExpectedAnonymous';

import FormSignup from './FormSignup';

function RegisterPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }
  if (user) {
    return <ExpectedAnonymous />;
  } else {
    return <FormSignup />;
  }
}

export default RegisterPage;
