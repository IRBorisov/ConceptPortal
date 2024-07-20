'use client';

import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';

import SelectLocationContext from '@/components/select/SelectLocationContext';
import SelectLocationHead from '@/components/select/SelectLocationHead';
import Label from '@/components/ui/Label';
import Modal, { ModalProps } from '@/components/ui/Modal';
import TextArea from '@/components/ui/TextArea';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { LocationHead } from '@/models/library';
import { combineLocation, validateLocation } from '@/models/libraryAPI';
import { limits } from '@/utils/constants';

interface DlgChangeLocationProps extends Pick<ModalProps, 'hideWindow'> {
  initial: string;
  onChangeLocation: (newLocation: string) => void;
}

function DlgChangeLocation({ hideWindow, initial, onChangeLocation }: DlgChangeLocationProps) {
  const { user } = useAuth();
  const [head, setHead] = useState<LocationHead>(initial.substring(0, 2) as LocationHead);
  const [body, setBody] = useState<string>(initial.substring(3));

  const { folders } = useLibrary();

  const location = useMemo(() => combineLocation(head, body), [head, body]);
  const isValid = useMemo(() => initial !== location && validateLocation(location), [initial, location]);

  const handleSelectLocation = useCallback((newValue: string) => {
    setHead(newValue.substring(0, 2) as LocationHead);
    setBody(newValue.length > 3 ? newValue.substring(3) : '');
  }, []);

  function handleSubmit() {
    onChangeLocation(location);
  }

  return (
    <Modal
      overflowVisible
      header='Изменение расположения'
      submitText='Переместить'
      submitInvalidTooltip={`Допустимы буквы, цифры, подчерк, пробел и "!". Сегмент пути не может начинаться и заканчиваться пробелом. Общая длина (с корнем) не должна превышать ${limits.location_len}`}
      hideWindow={hideWindow}
      canSubmit={isValid}
      onSubmit={handleSubmit}
      className={clsx('w-[35rem]', 'pb-3 px-6 flex gap-3')}
    >
      <div className='flex flex-col gap-2 w-[7rem] h-min'>
        <Label className='select-none' text='Корень' />
        <SelectLocationHead
          value={head} // prettier: split-lines
          onChange={setHead}
          excluded={!user?.is_staff ? [LocationHead.LIBRARY] : []}
        />
      </div>
      <SelectLocationContext
        folderTree={folders}
        value={location}
        onChange={handleSelectLocation}
        className='max-h-[9.2rem]'
      />
      <TextArea
        id='dlg_cst_body'
        label='Путь'
        className='w-[23rem]'
        rows={3}
        value={body}
        onChange={event => setBody(event.target.value)}
      />
    </Modal>
  );
}

export default DlgChangeLocation;
