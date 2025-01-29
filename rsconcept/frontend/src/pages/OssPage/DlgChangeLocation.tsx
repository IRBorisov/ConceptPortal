'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { useAuthSuspense } from '@/backend/auth/useAuth';
import SelectLocationContext from '@/components/select/SelectLocationContext';
import SelectLocationHead from '@/components/select/SelectLocationHead';
import Label from '@/components/ui/Label';
import Modal from '@/components/ui/Modal';
import TextArea from '@/components/ui/TextArea';
import { LocationHead } from '@/models/library';
import { combineLocation, validateLocation } from '@/models/libraryAPI';
import { useDialogsStore } from '@/stores/dialogs';
import { limits } from '@/utils/constants';

export interface DlgChangeLocationProps {
  initial: string;
  onChangeLocation: (newLocation: string) => void;
}

function DlgChangeLocation() {
  const { initial, onChangeLocation } = useDialogsStore(state => state.props as DlgChangeLocationProps);
  const { user } = useAuthSuspense();
  const [head, setHead] = useState<LocationHead>(initial.substring(0, 2) as LocationHead);
  const [body, setBody] = useState<string>(initial.substring(3));

  const location = combineLocation(head, body);
  const isValid = initial !== location && validateLocation(location);

  function handleSelectLocation(newValue: string) {
    setHead(newValue.substring(0, 2) as LocationHead);
    setBody(newValue.length > 3 ? newValue.substring(3) : '');
  }

  return (
    <Modal
      overflowVisible
      header='Изменение расположения'
      submitText='Переместить'
      submitInvalidTooltip={`Допустимы буквы, цифры, подчерк, пробел и "!". Сегмент пути не может начинаться и заканчиваться пробелом. Общая длина (с корнем) не должна превышать ${limits.location_len}`}
      canSubmit={isValid}
      onSubmit={() => onChangeLocation(location)}
      className={clsx('w-[35rem]', 'pb-3 px-6 flex gap-3 h-[9rem]')}
    >
      <div className='flex flex-col gap-2 min-w-[7rem] h-min'>
        <Label className='select-none' text='Корень' />
        <SelectLocationHead
          value={head} // prettier: split-lines
          onChange={setHead}
          excluded={!user?.is_staff ? [LocationHead.LIBRARY] : []}
        />
      </div>
      <SelectLocationContext value={location} onChange={handleSelectLocation} className='max-h-[9.2rem]' />
      <TextArea id='dlg_cst_body' label='Путь' rows={3} value={body} onChange={event => setBody(event.target.value)} />
    </Modal>
  );
}

export default DlgChangeLocation;
