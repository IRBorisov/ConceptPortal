import { AccessPolicy, LibraryItemType } from './backend/types';
import { type FolderNode } from './models/folder-tree';
import { LocationHead } from './models/library';
import { validateLocation } from './models/library-api';

/**
 * Retrieves label for {@link LocationHead}.
 */
export function labelLocationHead(head: LocationHead): string {
  // prettier-ignore
  switch (head) {
    case LocationHead.USER:      return '/U : личные';
    case LocationHead.COMMON:    return '/S : общие';
    case LocationHead.LIBRARY:   return '/L : примеры';
    case LocationHead.PROJECTS:  return '/P : проекты';
  }
}

/**
 * Retrieves description for {@link LocationHead}.
 */
export function describeLocationHead(head: LocationHead): string {
  // prettier-ignore
  switch (head) {
    case LocationHead.USER:      return 'Личные схемы пользователя';
    case LocationHead.COMMON:    return 'Рабочий каталог публичных схем';
    case LocationHead.LIBRARY:   return 'Каталог неизменных схем-примеров';
    case LocationHead.PROJECTS:  return 'Рабочий каталог проектных схем';
  }
}

/**
 * Retrieves label for {@link FolderNode}.
 */
export function labelFolderNode(node: FolderNode): string {
  if (node.parent || !validateLocation('/' + node.text)) {
    return node.text;
  } else {
    return labelLocationHead(('/' + node.text) as LocationHead);
  }
}

/**
 * Retrieves description for {@link FolderNode}.
 */
export function describeFolderNode(node: FolderNode): string {
  return `${node.filesInside} | ${node.filesTotal}`;
}

/**
 * Retrieves label for {@link AccessPolicy}.
 */
export function labelAccessPolicy(policy: AccessPolicy): string {
  // prettier-ignore
  switch (policy) {
    case AccessPolicy.PRIVATE:     return 'Личный';
    case AccessPolicy.PROTECTED:   return 'Защищенный';
    case AccessPolicy.PUBLIC:      return 'Открытый';
  }
}

/**
 * Retrieves description for {@link AccessPolicy}.
 */
export function describeAccessPolicy(policy: AccessPolicy): string {
  // prettier-ignore
  switch (policy) {
    case AccessPolicy.PRIVATE:
      return 'Доступ только для владельца';
    case AccessPolicy.PROTECTED:
      return 'Доступ для владельца и редакторов';
    case AccessPolicy.PUBLIC:
      return 'Открытый доступ';
  }
}

/**
 * Retrieves label for {@link LibraryItemType}.
 */
export function labelLibraryItemType(itemType: LibraryItemType): string {
  // prettier-ignore
  switch (itemType) {
    case LibraryItemType.RSFORM:  return 'КС';
    case LibraryItemType.OSS:     return 'ОСС';
  }
}

/**
 * Retrieves description for {@link LibraryItemType}.
 */
export function describeLibraryItemType(itemType: LibraryItemType): string {
  // prettier-ignore
  switch (itemType) {
    case LibraryItemType.RSFORM:  return 'Концептуальная схема';
    case LibraryItemType.OSS:     return 'Операционная схема синтеза';
  }
}
