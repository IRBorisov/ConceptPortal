import { AccessPolicy, LibraryItemType, LocationHead } from '@/models/library';
import { CstMatchMode, DependencyMode } from '@/models/miscellaneous';
import { ExpressionStatus } from '@/models/rsform';

import {
  IconAlias,
  IconBusiness,
  IconFilter,
  IconFollow,
  IconFollowOff,
  IconFormula,
  IconGraphCollapse,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphOutputs,
  IconHide,
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
  IconTemplates,
  IconTerm,
  IconText,
  IconUser
} from './Icons';

export interface DomIconProps<RequestData> extends IconProps {
  value: RequestData;
}

export function ItemTypeIcon({ value, size = '1.25rem', className }: DomIconProps<LibraryItemType>) {
  switch (value) {
    case LibraryItemType.RSFORM:
      return <IconRSForm size={size} className={className ?? 'clr-text-primary'} />;
    case LibraryItemType.OSS:
      return <IconOSS size={size} className={className ?? 'clr-text-green'} />;
  }
}

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

export function VisibilityIcon({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconShow size={size} className={className ?? 'clr-text-green'} />;
  } else {
    return <IconHide size={size} className={className ?? 'clr-text-red'} />;
  }
}

export function SubscribeIcon({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconFollow size={size} className={className ?? 'clr-text-green'} />;
  } else {
    return <IconFollowOff size={size} className={className ?? 'clr-text-red'} />;
  }
}

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

export function DependencyIcon({ value, size = '1.25rem', className }: DomIconProps<DependencyMode>) {
  switch (value) {
    case DependencyMode.ALL:
      return <IconSettings size={size} className={className} />;
    case DependencyMode.EXPRESSION:
      return <IconText size={size} className={className ?? 'clr-text-primary'} />;
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
