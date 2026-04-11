import { useEffect, useEffectEvent, useRef } from 'react';

import { useRoleStore } from './role';

interface AdjustRoleProps {
  isOwner: boolean;
  isEditor: boolean;
  isStaff: boolean;
  adminMode: boolean;
}

export function useAdjustRole(input: AdjustRoleProps) {
  const adjustRole = useRoleStore(state => state.adjustRole);
  const onAdjustRoleEvent = useEffectEvent(adjustRole);
  const lastInput = useRef<string | null>(null);

  useEffect(
    function adjustRoleOnInputChange() {
      const serializedInput = JSON.stringify(input);
      if (lastInput.current !== serializedInput) {
        lastInput.current = serializedInput;
        onAdjustRoleEvent(input);
      }
    },
    [input]
  );
}
