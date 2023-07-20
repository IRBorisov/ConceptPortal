import { toast } from 'react-toastify';
import { BackendCallback } from './backendAPI';

export function shareCurrentURLProc() {
  const url = window.location.href + '&share';
  navigator.clipboard.writeText(url);
  toast.success(`Ссылка скопирована: ${url}`);
}

export function claimOwnershipProc(
  claim: (callback: BackendCallback) => void, 
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

export function deleteRSFormProc(
  destroy: (callback: BackendCallback) => void, 
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
