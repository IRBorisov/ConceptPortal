'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import { VisibilityIcon } from '@/components/DomainIcons';
import SelectAccessPolicy from '@/components/select/SelectAccessPolicy';
import SelectLocationHead from '@/components/select/SelectLocationHead';
import Checkbox from '@/components/ui/Checkbox';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Modal, { ModalProps } from '@/components/ui/Modal';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { AccessPolicy, ILibraryItem, LocationHead } from '@/models/library';
import { cloneTitle, combineLocation, validateLocation } from '@/models/libraryAPI';
import { ConstituentaID, IRSFormCloneData } from '@/models/rsform';
import { information } from '@/utils/labels';

interface DlgCloneLibraryItemProps extends Pick<ModalProps, 'hideWindow'> {
  base: ILibraryItem;
  initialLocation: string;
  selected: ConstituentaID[];
  totalCount: number;
}

function DlgCloneLibraryItem({ hideWindow, base, initialLocation, selected, totalCount }: DlgCloneLibraryItemProps) {
  const router = useConceptNavigation();
  const { user } = useAuth();
  const [title, setTitle] = useState(cloneTitle(base));
  const [alias, setAlias] = useState(base.alias);
  const [comment, setComment] = useState(base.comment);
  const [visible, setVisible] = useState(true);
  const [policy, setPolicy] = useState(AccessPolicy.PUBLIC);

  const [onlySelected, setOnlySelected] = useState(false);

  const [head, setHead] = useState(initialLocation.substring(0, 2) as LocationHead);
  const [body, setBody] = useState(initialLocation.substring(3));
  const location = useMemo(() => combineLocation(head, body), [head, body]);

  const { cloneItem } = useLibrary();

  const canSubmit = useMemo(() => title !== '' && alias !== '' && validateLocation(location), [title, alias, location]);

  function handleSubmit() {
    const data: IRSFormCloneData = {
      item_type: base.item_type,
      title: title,
      alias: alias,
      comment: comment,
      read_only: false,
      visible: visible,
      access_policy: policy,
      location: location
    };
    if (onlySelected) {
      data.items = selected;
    }
    cloneItem(base.id, data, newSchema => {
      toast.success(information.cloneComplete(newSchema.alias));
      router.push(urls.schema(newSchema.id));
    });
  }

  return (
    <Modal
      header='Создание копии концептуальной схемы'
      hideWindow={hideWindow}
      canSubmit={canSubmit}
      submitText='Создать'
      onSubmit={handleSubmit}
      className={clsx('px-6 py-2', 'cc-column', 'max-h-full w-[30rem]')}
    >
      <TextInput
        id='dlg_full_name'
        label='Полное название'
        value={title}
        onChange={event => setTitle(event.target.value)}
      />
      <div className='flex justify-between gap-3'>
        <TextInput
          id='dlg_alias'
          label='Сокращение'
          value={alias}
          className='w-[15rem]'
          onChange={event => setAlias(event.target.value)}
        />
        <div className='flex flex-col gap-2'>
          <Label text='Доступ' className='self-center select-none' />
          <div className='ml-auto cc-icons'>
            <SelectAccessPolicy
              stretchLeft // prettier: split-lines
              value={policy}
              onChange={newPolicy => setPolicy(newPolicy)}
            />

            <MiniButton
              title={visible ? 'Библиотека: отображать' : 'Библиотека: скрывать'}
              icon={<VisibilityIcon value={visible} />}
              onClick={() => setVisible(prev => !prev)}
            />
          </div>
        </div>
      </div>

      <div className='flex justify-between gap-3'>
        <div className='flex flex-col gap-2 w-[7rem] h-min'>
          <Label text='Корень' />
          <SelectLocationHead
            value={head}
            onChange={setHead}
            excluded={!user?.is_staff ? [LocationHead.LIBRARY] : []}
          />
        </div>
        <TextArea
          id='dlg_cst_body'
          label='Путь'
          className='w-[18rem]'
          rows={3}
          value={body}
          onChange={event => setBody(event.target.value)}
        />
      </div>

      <TextArea id='dlg_comment' label='Описание' value={comment} onChange={event => setComment(event.target.value)} />

      <Checkbox
        id='dlg_only_selected'
        label={`Только выбранные конституенты [${selected.length} из ${totalCount}]`}
        value={onlySelected}
        setValue={value => setOnlySelected(value)}
      />
    </Modal>
  );
}

export default DlgCloneLibraryItem;
