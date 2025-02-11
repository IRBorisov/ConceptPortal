import { FolderNode } from './models/FolderTree';
import { LocationHead } from './models/library';
import { validateLocation } from './models/libraryAPI';

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
