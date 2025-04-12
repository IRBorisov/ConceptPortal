import { type DomIconProps } from '@/components/icons';
import {
  IconCstAxiom,
  IconCstBaseSet,
  IconCstConstSet,
  IconCstFunction,
  IconCstPredicate,
  IconCstStructured,
  IconCstTerm,
  IconCstTheorem
} from '@/components/icons';

import { CstType } from '../backend/types';

/** Icon for constituenta type. */
export function IconCstType({ value, size = '1.25rem', className }: DomIconProps<CstType>) {
  switch (value) {
    case CstType.BASE:
      return <IconCstBaseSet size={size} className={className ?? 'text-constructive'} />;
    case CstType.CONSTANT:
      return <IconCstConstSet size={size} className={className ?? 'text-constructive'} />;
    case CstType.STRUCTURED:
      return <IconCstStructured size={size} className={className ?? 'text-constructive'} />;
    case CstType.TERM:
      return <IconCstTerm size={size} className={className ?? 'text-primary'} />;
    case CstType.AXIOM:
      return <IconCstAxiom size={size} className={className ?? 'text-destructive'} />;
    case CstType.FUNCTION:
      return <IconCstFunction size={size} className={className ?? 'text-primary'} />;
    case CstType.PREDICATE:
      return <IconCstPredicate size={size} className={className ?? 'text-destructive'} />;
    case CstType.THEOREM:
      return <IconCstTheorem size={size} className={className ?? 'text-destructive'} />;
  }
}
