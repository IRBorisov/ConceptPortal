'use client';

import { useEffect } from 'react';

import { PARAMETER } from '@/utils/constants';

export function useResetAttribute(elementRef: React.RefObject<HTMLElement | null>, attribute: string) {
  useEffect(() => {
    // Trigger tooltip re-initialization after component mounts and tab becomes visible
    // This ensures tooltips work when loading the page directly with this tab active
    // React-tabs hides inactive panels with CSS (display: none), so react-tooltip v5
    // needs to re-scan the DOM when elements become visible
    const timeoutId = setTimeout(() => {
      if (!elementRef.current) {
        return;
      }

      // Force react-tooltip to re-scan by temporarily removing and re-adding data-tooltip-id
      // This triggers react-tooltip's internal MutationObserver to re-register the elements
      const tooltipElements = elementRef.current.querySelectorAll(`[${attribute}]`);
      for (const element of tooltipElements) {
        if (element instanceof HTMLElement) {
          const value = element.getAttribute(attribute);
          if (value) {
            element.removeAttribute(attribute);
            requestAnimationFrame(() => {
              element.setAttribute(attribute, value);
            });
          }
        }
      }
    }, PARAMETER.minimalTimeout);

    return () => clearTimeout(timeoutId);
  }, [elementRef, attribute]);
}
