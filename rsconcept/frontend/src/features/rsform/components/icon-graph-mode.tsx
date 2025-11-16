import { type DomIconProps, IconEditorMode, IconShow } from '@/components/icons';

import { InteractionMode } from '../stores/term-graph';

/** Icon for TermGraphMode. */
export function IconGraphMode({ value, size = '1.25rem', className }: DomIconProps<InteractionMode>) {
  switch (value) {
    case InteractionMode.edit:
      return <IconEditorMode size={size} className={className} />;
    case InteractionMode.explore:
      return <IconShow size={size} className={className} />;
  }
}
