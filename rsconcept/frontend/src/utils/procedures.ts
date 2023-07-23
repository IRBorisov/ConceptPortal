import { toast } from 'react-toastify';
import { BackendCallback } from './backendAPI';
import fileDownload from 'js-file-download';

export function shareCurrentURLProc() {
  const url = window.location.href + '&share';
  navigator.clipboard.writeText(url);
  toast.success(`Ссылка скопирована: ${url}`);
}

export async function claimOwnershipProc(
  claim: (callback: BackendCallback) => Promise<void>, 
  reload: Function
) {
  if (!window.confirm('Вы уверены, что хотите стать владельцем данной схемы?')) {
    return;
  }
  claim(() => {
    toast.success('Вы стали владельцем схемы');
    reload();
  });
}

export async function deleteRSFormProc(
  destroy: (callback: BackendCallback) => Promise<void>, 
  navigate: Function
) {
  if (!window.confirm('Вы уверены, что хотите удалить данную схему?')) {
    return;
  }
  destroy(() => {
    toast.success('Схема удалена');
    navigate('/rsforms?filter=personal');
  });
}

export async function downloadRSFormProc(
  download: (callback: BackendCallback) => Promise<void>, 
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
