import fileDownload from 'js-file-download';
import { toast } from 'react-toastify';

import { type DataCallback } from './backendAPI';
import { IRSFormMeta } from './models';

export function shareCurrentURLProc() {
  const url = window.location.href + '&share';
  navigator.clipboard.writeText(url)
  .then(() => toast.success(`Ссылка скопирована: ${url}`))
  .catch(console.error);
}

export function claimOwnershipProc(
  claim: (callback: DataCallback<IRSFormMeta>) => void
) {
  if (!window.confirm('Вы уверены, что хотите стать владельцем данной схемы?')) {
    return;
  }
  claim(() => toast.success('Вы стали владельцем схемы'));
}

export function deleteRSFormProc(
  destroy: (callback: DataCallback) => void,
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
  download: (callback: DataCallback<Blob>) => void,
  fileName: string
) {
  download((data) => {
    try {
      fileDownload(data, fileName);
    } catch (error) {
      console.error(error);
    }
  });
}
