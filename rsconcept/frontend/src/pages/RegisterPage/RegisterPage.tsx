import Loader from '@/components/ui/Loader';
import ExpectedAnonymous from '@/components/wrap/ExpectedAnonymous';
import { useAuth } from '@/context/AuthContext';

import FormSignup from './FormSignup';

function RegisterPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }
  if (user) {
    return <ExpectedAnonymous />;
  } else {
    return <FormSignup />;
  }
}

export default RegisterPage;
