import { useCallback, useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';

interface PanOptions {
  panSpeed: number;
}

export function useContinuousPan(
  ref: React.RefObject<HTMLDivElement | null>,
  options: PanOptions = {
    panSpeed: 15
  }
) {
  const { getViewport, setViewport } = useReactFlow();

  const keysPressed = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);

  const panLoop = useCallback(() => {
    const viewport = getViewport();
    let { x, y } = viewport;

    if (keysPressed.current.has('KeyW')) y += options.panSpeed;
    if (keysPressed.current.has('KeyS')) y -= options.panSpeed;
    if (keysPressed.current.has('KeyA')) x += options.panSpeed;
    if (keysPressed.current.has('KeyD')) x -= options.panSpeed;

    void setViewport({ x, y, zoom: viewport.zoom }, { duration: 0 });
    // eslint-disable-next-line react-hooks/immutability
    rafRef.current = requestAnimationFrame(() => panLoop());
  }, [options.panSpeed, getViewport, setViewport]);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
      if (!['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) return;

      event.preventDefault();
      event.stopPropagation();
      keysPressed.current.add(event.code);
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(panLoop);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.code);
      if (keysPressed.current.size === 0 && rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const handleBlur = () => {
      keysPressed.current.clear();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    element.addEventListener('keydown', handleKeyDown, { passive: false });
    element.addEventListener('keyup', handleKeyUp);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('keyup', handleKeyUp);
      element.removeEventListener('blur', handleBlur);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ref, panLoop]);
}
