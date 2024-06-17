import { AnimatePresence } from 'framer-motion';

import Loader from '@/components/ui/Loader';
import AnimateFade from '@/components/wrap/AnimateFade';
import ExpectedAnonymous from '@/components/wrap/ExpectedAnonymous';
import { useAuth } from '@/context/AuthContext';

import FormSignup from './FormSignup';

function RegisterPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }
  if (user && !loading) {
    return (
      <AnimateFade>
        <ExpectedAnonymous />
      </AnimateFade>
    );
  }
  return (
    <AnimatePresence mode='wait'>
      {loading ? <Loader key='signup-loader' /> : null}
      {!loading && user ? (
        <AnimateFade key='signup-has-user'>
          <ExpectedAnonymous />
        </AnimateFade>
      ) : null}
      {!loading && !user ? (
        <AnimateFade key='signup-no-user'>
          <FormSignup />
        </AnimateFade>
      ) : null}
    </AnimatePresence>
  );
}

export default RegisterPage;
