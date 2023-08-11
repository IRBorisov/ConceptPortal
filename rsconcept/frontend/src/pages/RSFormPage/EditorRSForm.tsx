import { useCallback, useLayoutEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';

import Checkbox from '../../components/Common/Checkbox';
import MiniButton from '../../components/Common/MiniButton';
import SubmitButton from '../../components/Common/SubmitButton';
import TextArea from '../../components/Common/TextArea';
import TextInput from '../../components/Common/TextInput';
import { CrownIcon, DownloadIcon, DumpBinIcon, SaveIcon, ShareIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useRSForm } from '../../context/RSFormContext';
import { useUsers } from '../../context/UsersContext';
import { IRSFormCreateData } from '../../utils/models';
import { claimOwnershipProc, downloadRSFormProc, shareCurrentURLProc } from '../../utils/procedures';

interface EditorRSFormProps {
  onDestroy: () => void
}

function EditorRSForm({ onDestroy }: EditorRSFormProps) {
  const intl = useIntl();
  const { getUserLabel } = useUsers();
  const {
    schema, update, download,
    isEditable, isOwned, isClaimable, processing, claim
  } = useRSForm();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);

  const [isModified, setIsModified] = useState(true);

  useLayoutEffect(() => {
    if (!schema) {
      setIsModified(false);
      return;
    }
    setIsModified(
      schema.title !== title ||
      schema.alias !== alias ||
      schema.comment !== comment ||
      schema.is_common !== common
    );
  }, [schema, schema?.title, schema?.alias, schema?.comment, schema?.is_common,
      title, alias, comment, common]);

  useLayoutEffect(() => {
    if (schema) {
      setTitle(schema.title);
      setAlias(schema.alias);
      setComment(schema.comment);
      setCommon(schema.is_common);
    }
  }, [schema]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data: IRSFormCreateData = {
      title: title,
      alias: alias,
      comment: comment,
      is_common: common
    };
    update(data, () => toast.success('Изменения сохранены'));
  };

  const handleDownload = useCallback(() => {
    const fileName = (schema?.alias ?? 'Schema') + '.trs';
    downloadRSFormProc(download, fileName);
  }, [download, schema?.alias]);

  return (
    <form onSubmit={handleSubmit} className='flex-grow max-w-xl px-4 py-2 border min-w-fit'>
      <div className='relative w-full'>
      <div className='absolute top-0 right-0'>
        <MiniButton
          tooltip='Поделиться схемой'
          icon={<ShareIcon size={5} color='text-primary'/>}
          onClick={shareCurrentURLProc}
        />
        <MiniButton
          tooltip='Скачать TRS файл'
          icon={<DownloadIcon size={5} color='text-primary'/>}
          onClick={handleDownload}
        />
        <MiniButton
          tooltip={isClaimable ? 'Стать владельцем' : 'Вы уже являетесь владельцем' }
          icon={<CrownIcon size={5} color={isOwned ? '' : 'text-green'}/>}
          disabled={!isClaimable || !user}
          onClick={() => { claimOwnershipProc(claim); }}
        />
        <MiniButton
          tooltip='Удалить схему'
          disabled={!isEditable}
          onClick={onDestroy}
          icon={<DumpBinIcon size={5} color={isEditable ? 'text-red' : ''} />}
        />
      </div>
      </div>
      <TextInput id='title' label='Полное название' type='text'
        required
        value={title}
        disabled={!isEditable}
        onChange={event => { setTitle(event.target.value); }}
      />
      <TextInput id='alias' label='Сокращение' type='text'
        required
        value={alias}
        disabled={!isEditable}
        widthClass='max-w-sm'
        onChange={event => { setAlias(event.target.value); }}
      />
      <TextArea id='comment' label='Комментарий'
        value={comment}
        disabled={!isEditable}
        onChange={event => { setComment(event.target.value); }}
      />
      <Checkbox id='common' label='Общедоступная схема'
        value={common}
        disabled={!isEditable}
        onChange={event => { setCommon(event.target.checked); }}
      />

      <div className='flex items-center justify-between gap-1 py-2 mt-2'>
        <SubmitButton
          text='Сохранить изменения'
          loading={processing}
          disabled={!isModified || !isEditable}
          icon={<SaveIcon size={6} />}
        />
      </div>

      <div className='flex justify-start mt-2'>
        <label className='font-semibold'>Владелец:</label>
        <span className='min-w-[200px] ml-2 overflow-ellipsis overflow-hidden whitespace-nowrap'>
          {getUserLabel(schema?.owner ?? null)}
        </span>
      </div>
      <div className='flex justify-start mt-2'>
        <label className='font-semibold'>Дата обновления:</label>
        <span className='ml-2'>{schema && new Date(schema?.time_update).toLocaleString(intl.locale)}</span>
      </div>
      <div className='flex justify-start mt-2'>
        <label className='font-semibold'>Дата создания:</label>
        <span className='ml-8'>{schema && new Date(schema?.time_create).toLocaleString(intl.locale)}</span>
      </div>
    </form>
  );
}

export default EditorRSForm;
