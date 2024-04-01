import { ToastContainer, type ToastContainerProps } from 'react-toastify';

import { useConceptOptions } from '@/context/OptionsContext';

interface ToasterThemedProps extends Omit<ToastContainerProps, 'theme'> {}

function ToasterThemed(props: ToasterThemedProps) {
  const { darkMode } = useConceptOptions();

  return <ToastContainer theme={darkMode ? 'dark' : 'light'} {...props} />;
}

export default ToasterThemed;
