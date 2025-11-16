import { type DomIconProps, IconLinkAll, IconLinkAttribution, IconLinkDefinition } from '@/components/icons';

import { TGEdgeType } from '../stores/term-graph';

/** Icon for TGEdgeType. */
export function IconEdgeType({ value, size = '1.25rem', className }: DomIconProps<TGEdgeType>) {
  switch (value) {
    case TGEdgeType.full:
      return <IconLinkAll size={size} className={className} />;
    case TGEdgeType.attribution:
      return <IconLinkAttribution size={size} className={className} />;
    case TGEdgeType.definition:
      return <IconLinkDefinition size={size} className={className} />;
  }
}
