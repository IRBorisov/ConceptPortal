import { AccessPolicy, LibraryItemType, LocationHead } from '@/models/library';
import { CstMatchMode, DependencyMode } from '@/models/miscellaneous';
import { CstType, ExpressionStatus } from '@/models/rsform';

import {
  IconAlias,
  IconBusiness,
  IconCstAxiom,
  IconCstBaseSet,
  IconCstConstSet,
  IconCstFunction,
  IconCstPredicate,
  IconCstStructured,
  IconCstTerm,
  IconCstTheorem,
  IconFilter,
  IconFormula,
  IconGraphCollapse,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphOutputs,
  IconHide,
  IconMoveDown,
  IconMoveUp,
  IconOSS,
  IconPrivate,
  IconProps,
  IconProtected,
  IconPublic,
  IconRSForm,
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

/** Icon for library item type. */
export function ItemTypeIcon({ value, size = '1.25rem', className }: DomIconProps<LibraryItemType>) {
  switch (value) {
    case LibraryItemType.RSFORM:
      return <IconRSForm size={size} className={className ?? 'clr-text-primary'} />;
    case LibraryItemType.OSS:
      return <IconOSS size={size} className={className ?? 'clr-text-green'} />;
  }
}

/** Icon for access policy. */
export function PolicyIcon({ value, size = '1.25rem', className }: DomIconProps<AccessPolicy>) {
  switch (value) {
    case AccessPolicy.PRIVATE:
      return <IconPrivate size={size} className={className ?? 'clr-text-red'} />;
    case AccessPolicy.PROTECTED:
      return <IconProtected size={size} className={className ?? 'clr-text-primary'} />;
    case AccessPolicy.PUBLIC:
      return <IconPublic size={size} className={className ?? 'clr-text-green'} />;
  }
}

/** Icon for visibility. */
export function VisibilityIcon({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconShow size={size} className={className ?? 'clr-text-green'} />;
  } else {
    return <IconHide size={size} className={className ?? 'clr-text-red'} />;
  }
}

/** Icon for subfolders. */
export function SubfoldersIcon({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconSubfolders size={size} className={className ?? 'clr-text-green'} />;
  } else {
    return <IconSubfolders size={size} className={className ?? 'clr-text-primary'} />;
  }
}

/** Icon for location. */
export function LocationIcon({ value, size = '1.25rem', className }: DomIconProps<string>) {
  switch (value.substring(0, 2) as LocationHead) {
    case LocationHead.COMMON:
      return <IconPublic size={size} className={className ?? 'clr-text-primary'} />;
    case LocationHead.LIBRARY:
      return <IconTemplates size={size} className={className ?? 'clr-text-red'} />;
    case LocationHead.PROJECTS:
      return <IconBusiness size={size} className={className ?? 'clr-text-primary'} />;
    case LocationHead.USER:
      return <IconUser size={size} className={className ?? 'clr-text-green'} />;
  }
}

/** Icon for term graph dependency mode. */
export function DependencyIcon({ value, size = '1.25rem', className }: DomIconProps<DependencyMode>) {
  switch (value) {
    case DependencyMode.ALL:
      return <IconSettings size={size} className={className} />;
    case DependencyMode.OUTPUTS:
      return <IconGraphOutputs size={size} className={className ?? 'clr-text-primary'} />;
    case DependencyMode.INPUTS:
      return <IconGraphInputs size={size} className={className ?? 'clr-text-primary'} />;
    case DependencyMode.EXPAND_OUTPUTS:
      return <IconGraphExpand size={size} className={className ?? 'clr-text-primary'} />;
    case DependencyMode.EXPAND_INPUTS:
      return <IconGraphCollapse size={size} className={className ?? 'clr-text-primary'} />;
  }
}

/** Icon for constituenta match mode. */
export function MatchModeIcon({ value, size = '1.25rem', className }: DomIconProps<CstMatchMode>) {
  switch (value) {
    case CstMatchMode.ALL:
      return <IconFilter size={size} className={className} />;
    case CstMatchMode.TEXT:
      return <IconText size={size} className={className ?? 'clr-text-primary'} />;
    case CstMatchMode.EXPR:
      return <IconFormula size={size} className={className ?? 'clr-text-primary'} />;
    case CstMatchMode.TERM:
      return <IconTerm size={size} className={className ?? 'clr-text-primary'} />;
    case CstMatchMode.NAME:
      return <IconAlias size={size} className={className ?? 'clr-text-primary'} />;
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

/** Icon for constituenta type. */
export function CstTypeIcon({ value, size = '1.25rem', className }: DomIconProps<CstType>) {
  switch (value) {
    case CstType.BASE:
      return <IconCstBaseSet size={size} className={className ?? 'clr-text-green'} />;
    case CstType.CONSTANT:
      return <IconCstConstSet size={size} className={className ?? 'clr-text-green'} />;
    case CstType.STRUCTURED:
      return <IconCstStructured size={size} className={className ?? 'clr-text-green'} />;
    case CstType.TERM:
      return <IconCstTerm size={size} className={className ?? 'clr-text-primary'} />;
    case CstType.AXIOM:
      return <IconCstAxiom size={size} className={className ?? 'clr-text-red'} />;
    case CstType.FUNCTION:
      return <IconCstFunction size={size} className={className ?? 'clr-text-primary'} />;
    case CstType.PREDICATE:
      return <IconCstPredicate size={size} className={className ?? 'clr-text-red'} />;
    case CstType.THEOREM:
      return <IconCstTheorem size={size} className={className ?? 'clr-text-red'} />;
  }
}

/** Icon for relocation direction. */
export function RelocateUpIcon({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconMoveUp size={size} className={className ?? 'clr-text-primary'} />;
  } else {
    return <IconMoveDown size={size} className={className ?? 'clr-text-primary'} />;
  }
}
