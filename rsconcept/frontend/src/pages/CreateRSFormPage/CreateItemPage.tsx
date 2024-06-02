import AnimateFade from '@/components/wrap/AnimateFade';
import RequireAuth from '@/components/wrap/RequireAuth';

import FormCreateItem from './FormCreateItem';

function CreateItemPage() {
  return (
    <AnimateFade>
      <RequireAuth>
        <FormCreateItem />
      </RequireAuth>
    </AnimateFade>
  );
}

export default CreateItemPage;
