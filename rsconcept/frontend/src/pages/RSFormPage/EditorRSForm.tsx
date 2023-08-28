import { useLayoutEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';

import Checkbox from '../../components/Common/Checkbox';
import ConceptTooltip from '../../components/Common/ConceptTooltip';
import MiniButton from '../../components/Common/MiniButton';
import SubmitButton from '../../components/Common/SubmitButton';
import TextArea from '../../components/Common/TextArea';
import TextInput from '../../components/Common/TextInput';
import HelpRSFormMeta from '../../components/Help/HelpRSFormMeta';
import { CrownIcon, DownloadIcon, DumpBinIcon, HelpIcon, SaveIcon, ShareIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useRSForm } from '../../context/RSFormContext';
import { useUsers } from '../../context/UsersContext';
import useModificationPrompt from '../../hooks/useModificationPrompt';
import { IRSFormCreateData, LibraryItemType } from '../../utils/models';

interface EditorRSFormProps {
  onDestroy: () => void
  onClaim: () => void
  onShare: () => void
  onDownload: () => void
}

function EditorRSForm({ onDestroy, onClaim, onShare, onDownload }: EditorRSFormProps) {
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

  const { isModified, setIsModified } = useModificationPrompt();

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

  return (
    <form onSubmit={handleSubmit} className='flex-grow max-w-[35.3rem] px-4 py-2 border-y border-r clr-border min-w-fit'>
      <div className='relative w-full'>
      <div className='absolute top-0 right-0 flex'>
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
          icon={<CrownIcon size={5} color={!isClaimable ? '' : 'text-green'}/>}
          disabled={!isClaimable || !user}
          onClick={onClaim}
        />
        <MiniButton
          tooltip='Удалить схему'
          disabled={!isEditable}
          onClick={onDestroy}
          icon={<DumpBinIcon size={5} color={isEditable ? 'text-red' : ''} />}
        />
        <div id='rsform-help' className='py-1 ml-1'>
          <HelpIcon color='text-primary' size={5} />
        </div>
        <ConceptTooltip anchorSelect='#rsform-help'>
          <HelpRSFormMeta />
        </ConceptTooltip>
      </div>
      </div>
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
        widthClass='max-w-sm'
        onChange={event => setAlias(event.target.value)}
      />
      <TextArea id='comment' label='Комментарий'
        value={comment}
        disabled={!isEditable}
        onChange={event => setComment(event.target.value)}
      />
      <div className='flex justify-between whitespace-nowrap'>
        <div></div>
        <Checkbox id='common' label='Общедоступная схема'
          value={common}
          disabled={!isEditable}
          onChange={event => setCommon(event.target.checked)}
        />
        <Checkbox id='canonical' label='Библиотечная схема'
          widthClass='w-fit'
          value={canonical}
          tooltip='Только администраторы могут присваивать схемам библиотечный статус'
          disabled={!isEditable || !isForceAdmin}
          onChange={event => setCanonical(event.target.checked)}
        />
      </div>

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
        <label className='font-semibold'>Отслеживают:</label>
        <span id='subscriber-count' className='ml-2'>
          { schema?.subscribers.length ?? 0 }
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
