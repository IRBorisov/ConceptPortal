import { Dispatch, SetStateAction, useLayoutEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';

import Checkbox from '../../components/Common/Checkbox';
import ConceptTooltip from '../../components/Common/ConceptTooltip';
import Divider from '../../components/Common/Divider';
import MiniButton from '../../components/Common/MiniButton';
import SubmitButton from '../../components/Common/SubmitButton';
import TextArea from '../../components/Common/TextArea';
import TextInput from '../../components/Common/TextInput';
import HelpRSFormMeta from '../../components/Help/HelpRSFormMeta';
import { DownloadIcon, DumpBinIcon, HelpIcon, OwnerIcon, SaveIcon, ShareIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useRSForm } from '../../context/RSFormContext';
import { useUsers } from '../../context/UsersContext';
import { LibraryItemType } from '../../models/library';
import { IRSFormCreateData } from '../../models/rsform';
import RSFormStats from './elements/RSFormStats';

interface EditorRSFormProps {
  onDestroy: () => void
  onClaim: () => void
  onShare: () => void
  onDownload: () => void
  isModified: boolean
  setIsModified: Dispatch<SetStateAction<boolean>>
}

function EditorRSForm({ onDestroy, onClaim, onShare, isModified, setIsModified, onDownload }: EditorRSFormProps) {
  const intl = useIntl();
  const { getUserLabel } = useUsers();
  const {
    schema, update, isForceAdmin,
    isEditable, isClaimable, processing
  } = useRSForm();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);
  const [canonical, setCanonical] = useState(false);

  useLayoutEffect(() => {
    if (!schema) {
      setIsModified(false);
      return;
    }
    setIsModified(
      schema.title !== title ||
      schema.alias !== alias ||
      schema.comment !== comment ||
      schema.is_common !== common ||
      schema.is_canonical !== canonical
    );
    return () => setIsModified(false);
  }, [schema, schema?.title, schema?.alias, schema?.comment,
      schema?.is_common, schema?.is_canonical,
      title, alias, comment, common, canonical, setIsModified]);

  useLayoutEffect(() => {
    if (schema) {
      setTitle(schema.title);
      setAlias(schema.alias);
      setComment(schema.comment);
      setCommon(schema.is_common);
      setCanonical(schema.is_canonical);
    }
  }, [schema]);

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    const data: IRSFormCreateData = {
      item_type: LibraryItemType.RSFORM,
      title: title,
      alias: alias,
      comment: comment,
      is_common: common,
      is_canonical: canonical
    };
    update(data, () => toast.success('Изменения сохранены'));
  };

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.ctrlKey && event.code === 'KeyS') {
      if (isModified) {
        handleSubmit();
      }
      event.preventDefault();
    }
  }

  return (
  <div tabIndex={-1} onKeyDown={handleInput}>
    <div className='relative flex items-start justify-center w-full'>
    <div className='absolute flex mt-1'>
      <MiniButton
        tooltip='Сохранить изменения'
        disabled={!isModified || !isEditable}
        icon={<SaveIcon size={5} color={isModified && isEditable ? 'text-primary' : ''}/>}
        onClick={() => handleSubmit()}
      />
      <MiniButton
        tooltip='Поделиться схемой'
        icon={<ShareIcon size={5} color='text-primary'/>}
        onClick={onShare}
      />
      <MiniButton
        tooltip='Скачать TRS файл'
        icon={<DownloadIcon size={5} color='text-primary'/>}
        onClick={onDownload}
      />
      <MiniButton
        tooltip={isClaimable ? 'Стать владельцем' : 'Невозможно стать владельцем' }
        icon={<OwnerIcon size={5} color={!isClaimable ? '' : 'text-success'}/>}
        disabled={!isClaimable || !user}
        onClick={onClaim}
      />
      <MiniButton
        tooltip='Удалить схему'
        disabled={!isEditable}
        onClick={onDestroy}
        icon={<DumpBinIcon size={5} color={isEditable ? 'text-warning' : ''} />}
      />
      <div id='rsform-help' className='py-1 ml-1'>
        <HelpIcon color='text-primary' size={5} />
      </div>
      <ConceptTooltip anchorSelect='#rsform-help'>
        <HelpRSFormMeta />
      </ConceptTooltip>
    </div>
    </div>
    <div className='flex w-full'>
      <form onSubmit={handleSubmit} className='flex-grow max-w-[40rem] min-w-[30rem] px-4 py-2'>
        <div className='flex flex-col gap-3 mt-2'>
          <TextInput id='title' label='Полное название' type='text'
            required
            value={title}
            disabled={!isEditable}
            onChange={event => setTitle(event.target.value)}
          />
          <TextInput id='alias' label='Сокращение' type='text'
            required
            value={alias}
            disabled={!isEditable}
            dense
            dimensions='w-full'
            onChange={event => setAlias(event.target.value)}
          />
          <TextArea id='comment' label='Комментарий'
            value={comment}
            disabled={!isEditable}
            onChange={event => setComment(event.target.value)}
          />
          <div className='flex justify-between whitespace-nowrap'>
            <Checkbox id='common' label='Общедоступная схема'
              tooltip='Общедоступные схемы видны всем пользователям и могут быть изменены'
              value={common}
              dimensions='w-fit'
              disabled={!isEditable}
              setValue={value => setCommon(value)}
            />
            <Checkbox id='canonical' label='Неизменная схема'
              dimensions='w-fit'
              value={canonical}
              tooltip='Только администраторы могут присваивать схемам неизменный статус'
              disabled={!isEditable || !isForceAdmin}
              setValue={value => setCanonical(value)}
            />
          </div>
          <div className='flex justify-center w-full'>
            <SubmitButton
              text='Сохранить изменения'
              loading={processing}
              disabled={!isModified || !isEditable}
              icon={<SaveIcon size={6} />}
              dimensions='my-2 w-fit'
            />
          </div>
          
          <div className='flex flex-col gap-1'>
            <div className='flex justify-start'>
              <label className='font-semibold'>Владелец:</label>
              <span className='min-w-[200px] ml-2 overflow-ellipsis overflow-hidden whitespace-nowrap'>
                {getUserLabel(schema?.owner ?? null)}
              </span>
            </div>
            <div className='flex justify-start'>
              <label className='font-semibold'>Отслеживают:</label>
              <span id='subscriber-count' className='ml-2'>
                { schema?.subscribers.length ?? 0 }
              </span>
            </div>
            <div className='flex justify-start'>
              <label className='font-semibold'>Дата обновления:</label>
              <span className='ml-2'>{schema && new Date(schema?.time_update).toLocaleString(intl.locale)}</span>
            </div>
            <div className='flex justify-start'>
              <label className='font-semibold'>Дата создания:</label>
              <span className='ml-8'>{schema && new Date(schema?.time_create).toLocaleString(intl.locale)}</span>
            </div>
          </div>
        </div>
      </form>
      {schema && <Divider vertical />}
      <RSFormStats stats={schema?.stats}/>
    </div>
  </div>);
}

export default EditorRSForm;
