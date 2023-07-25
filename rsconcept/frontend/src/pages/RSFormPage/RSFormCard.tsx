import { useCallback, useLayoutEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import Button from '../../components/Common/Button';
import Checkbox from '../../components/Common/Checkbox';
import SubmitButton from '../../components/Common/SubmitButton';
import TextArea from '../../components/Common/TextArea';
import TextInput from '../../components/Common/TextInput';
import { CrownIcon, DownloadIcon, DumpBinIcon, SaveIcon, ShareIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useRSForm } from '../../context/RSFormContext';
import { useUsers } from '../../context/UsersContext';
import { claimOwnershipProc, deleteRSFormProc, downloadRSFormProc, shareCurrentURLProc } from '../../utils/procedures';

function RSFormCard() {
  const navigate = useNavigate();
  const intl = useIntl();
  const { getUserLabel } = useUsers();
  const {
    schema, update, download,
    isEditable, isOwned, isClaimable, processing, destroy, claim
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
  }, [schema, title, alias, comment, common]);

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
    const data = {
      title,
      alias,
      comment,
      is_common: common
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    update(data, () => toast.success('Изменения сохранены'));
  };

  const handleDelete =
    useCallback(() => { deleteRSFormProc(destroy, navigate); }, [destroy, navigate]);

  const handleDownload = useCallback(() => {
    const fileName = (schema?.alias ?? 'Schema') + '.trs';
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    downloadRSFormProc(download, fileName);
  }, [download, schema?.alias]);

  return (
    <form onSubmit={handleSubmit} className='flex-grow max-w-xl px-4 py-2 border min-w-fit'>
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
        <div className='flex justify-end gap-1'>
          <Button
            tooltip='Поделиться схемой'
            icon={<ShareIcon color='text-primary'/>}
            onClick={shareCurrentURLProc}
          />
          <Button
            tooltip='Скачать TRS файл'
            icon={<DownloadIcon color='text-primary'/>}
            loading={processing}
            onClick={handleDownload}
          />
          <Button
            tooltip={isClaimable ? 'Стать владельцем' : 'Вы уже являетесь владельцем' }
            icon={<CrownIcon color={isOwned ? '' : 'text-green'}/>}
            loading={processing}
            disabled={!isClaimable || !user}
            onClick={() => { claimOwnershipProc(claim); }}
          />
          <Button
            tooltip={ isEditable ? 'Удалить схему' : 'Вы не можете редактировать данную схему'}
            icon={<DumpBinIcon color={isEditable ? 'text-red' : ''} />}
            loading={processing}
            disabled={!isEditable}
            onClick={handleDelete}
          />
        </div>
      </div>

      <div className='flex justify-start mt-2'>
        <label className='font-semibold'>Владелец:</label>
        <span className='min-w-[200px] ml-2 overflow-ellipsis overflow-hidden whitespace-nowrap'>
          {getUserLabel(schema?.owner)}
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

export default RSFormCard;
