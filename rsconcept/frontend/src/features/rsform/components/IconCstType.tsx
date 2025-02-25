import { type DomIconProps } from '@/components/Icons';
import {
  IconCstAxiom,
  IconCstBaseSet,
  IconCstConstSet,
  IconCstFunction,
  IconCstPredicate,
  IconCstStructured,
  IconCstTerm,
  IconCstTheorem
} from '@/components/Icons';

import { CstType } from '../backend/types';

/** Icon for constituenta type. */
export function IconCstType({ value, size = '1.25rem', className }: DomIconProps<CstType>) {
  switch (value) {
    case CstType.BASE:
      return <IconCstBaseSet size={size} className={className ?? 'text-ok-600'} />;
    case CstType.CONSTANT:
      return <IconCstConstSet size={size} className={className ?? 'text-ok-600'} />;
    case CstType.STRUCTURED:
      return <IconCstStructured size={size} className={className ?? 'text-ok-600'} />;
    case CstType.TERM:
      return <IconCstTerm size={size} className={className ?? 'text-sec-600'} />;
    case CstType.AXIOM:
      return <IconCstAxiom size={size} className={className ?? 'text-warn-600'} />;
    case CstType.FUNCTION:
      return <IconCstFunction size={size} className={className ?? 'text-sec-600'} />;
    case CstType.PREDICATE:
      return <IconCstPredicate size={size} className={className ?? 'text-warn-600'} />;
    case CstType.THEOREM:
      return <IconCstTheorem size={size} className={className ?? 'text-warn-600'} />;
  }
}
