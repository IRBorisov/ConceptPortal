import { AccessPolicy, LibraryItemType, LocationHead } from '@/models/library';
import { CstMatchMode, DependencyMode } from '@/models/miscellaneous';

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

export function LocationHeadIcon({ value: value, size = '1.25rem', className }: DomIconProps<LocationHead>) {
  switch (value) {
    case undefined:
      return <IconFilter size={size} className={className ?? 'clr-text-primary'} />;
    case LocationHead.COMMON:
      return <IconPublic size={size} className={className ?? 'clr-text-primary'} />;
    case LocationHead.LIBRARY:
      return <IconTemplates size={size} className={className ?? 'clr-text-primary'} />;
    case LocationHead.PROJECTS:
      return <IconBusiness size={size} className={className ?? 'clr-text-primary'} />;
    case LocationHead.USER:
      return <IconUser size={size} className={className ?? 'clr-text-primary'} />;
  }
}

export function DependencyIcon(mode: DependencyMode, size: string, color?: string) {
  switch (mode) {
    case DependencyMode.ALL:
      return <IconSettings size={size} className={color} />;
    case DependencyMode.EXPRESSION:
      return <IconText size={size} className={color} />;
    case DependencyMode.OUTPUTS:
      return <IconGraphOutputs size={size} className={color} />;
    case DependencyMode.INPUTS:
      return <IconGraphInputs size={size} className={color} />;
    case DependencyMode.EXPAND_OUTPUTS:
      return <IconGraphExpand size={size} className={color} />;
    case DependencyMode.EXPAND_INPUTS:
      return <IconGraphCollapse size={size} className={color} />;
  }
}

export function MatchModeIcon(mode: CstMatchMode, size: string, color?: string) {
  switch (mode) {
    case CstMatchMode.ALL:
      return <IconFilter size={size} className={color} />;
    case CstMatchMode.TEXT:
      return <IconText size={size} className={color} />;
    case CstMatchMode.EXPR:
      return <IconFormula size={size} className={color} />;
    case CstMatchMode.TERM:
      return <IconTerm size={size} className={color} />;
    case CstMatchMode.NAME:
      return <IconAlias size={size} className={color} />;
  }
}
