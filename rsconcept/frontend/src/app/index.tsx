export { useConceptNavigation } from './navigation1/navigation-context';
export { useBlockNavigation } from './navigation1/navigation-context';
export { urls } from './urls';
import { RouterProvider } from 'react-router';

import { Router } from './router1';

export function App() {
  return <RouterProvider router={Router} />;
}
