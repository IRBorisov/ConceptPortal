import { useRef, useState } from 'react';
import useClickedOutside from './useClickedOutside';

function useDropdown() {
  const [isActive, setIsActive] = useState(false);
  const ref = useRef(null);

  useClickedOutside({ref: ref, callback: () => setIsActive(false)})
  
  return {
    ref: ref, 
    isActive: isActive, 
    setIsActive: setIsActive,
    toggle: () => setIsActive(!isActive),
    hide: () => setIsActive(false)
  };
};

export default useDropdown;