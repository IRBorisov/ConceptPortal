import RequireAuth from '@/components/RequireAuth';

import FormCreateItem from './FormCreateItem';

function CreateItemPage() {
  return (
    <RequireAuth>
      <FormCreateItem />
    </RequireAuth>
  );
}

export default CreateItemPage;
