import fileDownload from 'js-file-download';
import { toast } from 'react-toastify';

import { type BackendCallback } from './backendAPI';

export function shareCurrentURLProc() {
  const url = window.location.href + '&share';
  navigator.clipboard.writeText(url)
  .then(() => toast.success(`Ссылка скопирована: ${url}`))
  .catch(console.error);
}

export function claimOwnershipProc(
  claim: (callback: BackendCallback) => void
) {
  if (!window.confirm('Вы уверены, что хотите стать владельцем данной схемы?')) {
    return;
  }
  claim(() => toast.success('Вы стали владельцем схемы'));
}

export function deleteRSFormProc(
  destroy: (callback: BackendCallback) => void,
  navigate: (path: string) => void
) {
  if (!window.confirm('Вы уверены, что хотите удалить данную схему?')) {
    return;
  }
  destroy(() => {
    toast.success('Схема удалена');
    navigate('/rsforms?filter=personal');
  });
}

export function downloadRSFormProc(
  download: (callback: BackendCallback) => void,
  fileName: string
) {
  download((response) => {
    try {
      fileDownload(response.data, fileName);
    } catch (error: any) {
      toast.error(error.message);
    }
  });
}
