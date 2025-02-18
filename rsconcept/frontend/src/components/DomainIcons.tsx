import { LocationHead } from '@/features/library/models/library';
import { ExpressionStatus } from '@/features/rsform/models/rsform';
import { CstMatchMode, DependencyMode } from '@/features/rsform/stores/cstSearch';

import {
  IconAlias,
  IconBusiness,
  IconFilter,
  IconFormula,
  IconGraphCollapse,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphOutputs,
  IconHide,
  IconMoveDown,
  IconMoveUp,
  IconProps,
  IconPublic,
  IconSettings,
  IconShow,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusOK,
  IconStatusUnknown,
  IconSubfolders,
  IconTemplates,
  IconTerm,
  IconText,
  IconUser
} from './Icons';

export interface DomIconProps<RequestData> extends IconProps {
  value: RequestData;
}

/** Icon for visibility. */
export function VisibilityIcon({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconShow size={size} className={className ?? 'text-ok-600'} />;
  } else {
    return <IconHide size={size} className={className ?? 'text-warn-600'} />;
  }
}

/** Icon for subfolders. */
export function SubfoldersIcon({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconSubfolders size={size} className={className ?? 'text-ok-600'} />;
  } else {
    return <IconSubfolders size={size} className={className ?? 'text-sec-600'} />;
  }
}

/** Icon for location. */
export function LocationIcon({ value, size = '1.25rem', className }: DomIconProps<string>) {
  switch (value.substring(0, 2) as LocationHead) {
    case LocationHead.COMMON:
      return <IconPublic size={size} className={className ?? 'text-sec-600'} />;
    case LocationHead.LIBRARY:
      return <IconTemplates size={size} className={className ?? 'text-warn-600'} />;
    case LocationHead.PROJECTS:
      return <IconBusiness size={size} className={className ?? 'text-sec-600'} />;
    case LocationHead.USER:
      return <IconUser size={size} className={className ?? 'text-ok-600'} />;
  }
}

/** Icon for term graph dependency mode. */
export function DependencyIcon({ value, size = '1.25rem', className }: DomIconProps<DependencyMode>) {
  switch (value) {
    case DependencyMode.ALL:
      return <IconSettings size={size} className={className} />;
    case DependencyMode.OUTPUTS:
      return <IconGraphOutputs size={size} className={className ?? 'text-sec-600'} />;
    case DependencyMode.INPUTS:
      return <IconGraphInputs size={size} className={className ?? 'text-sec-600'} />;
    case DependencyMode.EXPAND_OUTPUTS:
      return <IconGraphExpand size={size} className={className ?? 'text-sec-600'} />;
    case DependencyMode.EXPAND_INPUTS:
      return <IconGraphCollapse size={size} className={className ?? 'text-sec-600'} />;
  }
}

/** Icon for constituenta match mode. */
export function MatchModeIcon({ value, size = '1.25rem', className }: DomIconProps<CstMatchMode>) {
  switch (value) {
    case CstMatchMode.ALL:
      return <IconFilter size={size} className={className} />;
    case CstMatchMode.TEXT:
      return <IconText size={size} className={className ?? 'text-sec-600'} />;
    case CstMatchMode.EXPR:
      return <IconFormula size={size} className={className ?? 'text-sec-600'} />;
    case CstMatchMode.TERM:
      return <IconTerm size={size} className={className ?? 'text-sec-600'} />;
    case CstMatchMode.NAME:
      return <IconAlias size={size} className={className ?? 'text-sec-600'} />;
  }
}

/** Icon for expression status. */
export function StatusIcon({ value, size = '1.25rem', className }: DomIconProps<ExpressionStatus>) {
  switch (value) {
    case ExpressionStatus.VERIFIED:
    case ExpressionStatus.PROPERTY:
      return <IconStatusOK size={size} className={className} />;

    case ExpressionStatus.UNKNOWN:
      return <IconStatusUnknown size={size} className={className} />;
    case ExpressionStatus.INCALCULABLE:
      return <IconStatusIncalculable size={size} className={className} />;

    case ExpressionStatus.INCORRECT:
    case ExpressionStatus.UNDEFINED:
      return <IconStatusError size={size} className={className} />;
  }
}

/** Icon for relocation direction. */
export function RelocateUpIcon({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconMoveUp size={size} className={className ?? 'text-sec-600'} />;
  } else {
    return <IconMoveDown size={size} className={className ?? 'text-sec-600'} />;
  }
}
