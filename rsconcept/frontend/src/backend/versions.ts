/**
 * Endpoints: versions.
 */

import { IVersionData } from '@/models/library';
import { IRSFormData } from '@/models/rsform';

import { AxiosDelete, AxiosPatch, FrontAction, FrontPull, FrontPush } from './apiTransport';

export function patchVersion(target: string, request: FrontPush<IVersionData>) {
  // title: `Version id=${target}`,
  AxiosPatch({
    endpoint: `/api/versions/${target}`,
    request: request
  });
}

export function patchRestoreVersion(target: string, request: FrontPull<IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/versions/${target}/restore`,
    request: request
  });
}

export function deleteVersion(target: string, request: FrontAction) {
  AxiosDelete({
    endpoint: `/api/versions/${target}`,
    request: request
  });
}
