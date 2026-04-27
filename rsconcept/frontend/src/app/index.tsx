export { useConceptNavigation } from './navigation/navigation-context';
export { useRegisterNavigationSave } from './navigation/navigation-context';
export { urls } from './urls';
import { RouterProvider } from 'react-router';

import { Router } from './router';

export function App() {
  return <RouterProvider router={Router} />;
}
