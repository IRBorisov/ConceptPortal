/**
 * Endpoints: library.
 */

import {
  ILibraryCreateData,
  ILibraryItem,
  ILibraryUpdateData,
  ITargetAccessPolicy,
  ITargetLocation
} from '@/models/library';
import { IRSFormCloneData, IRSFormData } from '@/models/rsform';
import { ITargetUser, ITargetUsers } from '@/models/user';

import {
  AxiosDelete,
  AxiosGet,
  AxiosPatch,
  AxiosPost,
  FrontAction,
  FrontExchange,
  FrontPull,
  FrontPush
} from './apiTransport';

export function getLibrary(request: FrontPull<ILibraryItem[]>) {
  // title: 'Available LibraryItems list',
  AxiosGet({
    endpoint: '/api/library/active',
    request: request
  });
}

export function getAdminLibrary(request: FrontPull<ILibraryItem[]>) {
  // title: 'All LibraryItems list',
  AxiosGet({
    endpoint: '/api/library/all',
    request: request
  });
}

export function getTemplates(request: FrontPull<ILibraryItem[]>) {
  AxiosGet({
    endpoint: '/api/library/templates',
    request: request
  });
}

export function postCreateLibraryItem(request: FrontExchange<ILibraryCreateData, ILibraryItem>) {
  AxiosPost({
    endpoint: '/api/library',
    request: request
  });
}

export function postCloneLibraryItem(target: string, request: FrontExchange<IRSFormCloneData, IRSFormData>) {
  AxiosPost({
    endpoint: `/api/library/${target}/clone`,
    request: request
  });
}

export function patchLibraryItem(target: string, request: FrontExchange<ILibraryUpdateData, ILibraryItem>) {
  AxiosPatch({
    endpoint: `/api/library/${target}`,
    request: request
  });
}

export function deleteLibraryItem(target: string, request: FrontAction) {
  AxiosDelete({
    endpoint: `/api/library/${target}`,
    request: request
  });
}

export function patchSetOwner(target: string, request: FrontPush<ITargetUser>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/set-owner`,
    request: request
  });
}

export function patchSetAccessPolicy(target: string, request: FrontPush<ITargetAccessPolicy>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/set-access-policy`,
    request: request
  });
}

export function patchSetLocation(target: string, request: FrontPush<ITargetLocation>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/set-location`,
    request: request
  });
}

export function patchEditorsAdd(target: string, request: FrontPush<ITargetUser>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/editors-add`,
    request: request
  });
}

export function patchEditorsRemove(target: string, request: FrontPush<ITargetUser>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/editors-remove`,
    request: request
  });
}

export function patchEditorsSet(target: string, request: FrontPush<ITargetUsers>) {
  AxiosPatch({
    endpoint: `/api/library/${target}/editors-set`,
    request: request
  });
}

export function postSubscribe(target: string, request: FrontAction) {
  AxiosPost({
    endpoint: `/api/library/${target}/subscribe`,
    request: request
  });
}

export function deleteUnsubscribe(target: string, request: FrontAction) {
  AxiosDelete({
    endpoint: `/api/library/${target}/unsubscribe`,
    request: request
  });
}
