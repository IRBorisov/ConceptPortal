import { useIntl } from 'react-intl';
import Checkbox from '../../components/Common/Checkbox';
import SubmitButton from '../../components/Common/SubmitButton';
import TextArea from '../../components/Common/TextArea';
import TextInput from '../../components/Common/TextInput';
import { useRSForm } from '../../context/RSFormContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '../../components/Common/Button';
import { CrownIcon, DownloadIcon, DumpBinIcon } from '../../components/Icons';
import { useUsers } from '../../context/UsersContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosResponse } from 'axios';

function RSFormCard() {
  const navigate = useNavigate();
  const intl = useIntl();
  const { getUserLabel } = useUsers();
  const { schema, update, download, reload, isEditable, isClaimable, processing, destroy, claim } = useRSForm();

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);

  const fileRef = useRef<HTMLAnchorElement | null>(null);
  const [fileURL, setFileUrl] = useState<string>();
  const [fileName, setFileName] = useState<string>();

  useEffect(() => {
    setTitle(schema!.title)
    setAlias(schema!.alias)
    setComment(schema!.comment)
    setCommon(schema!.is_common)
  }, [schema]);
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      'title': title,
      'alias': alias,
      'comment': comment,
      'is_common': common,
    };
    update(data, () => {
      toast.success('Изменения сохранены');
      reload();
    });
  };

  const handleDelete = useCallback(() => {
    if (window.confirm('Вы уверены, что хотите удалить данную схему?')) {
      destroy(() => {
        toast.success('Схема удалена');
        navigate('/rsforms?filter=personal');
      });
    }
  }, [destroy, navigate]);

  const handleClaimOwner = useCallback(() => {
    if (window.confirm('Вы уверены, что хотите стать владельцем данной схемы?')) {
      claim(() => {
        toast.success('Вы стали владельцем схемы');
        reload();
      });
    }
  }, [claim, reload]);

  const handleDownload = useCallback(() => {
    download((response: AxiosResponse) => {
      try {
        setFileName((schema?.alias || 'Schema') + '.trs')
        setFileUrl(URL.createObjectURL(new Blob([response.data])));
        fileRef.current?.click();
        if (fileURL) URL.revokeObjectURL(fileURL);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  }, [download, schema?.alias, fileURL]);

  return (
    <form onSubmit={handleSubmit} className='flex-grow max-w-xl px-4 py-2 border'>
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
      <Checkbox id='common' label='Общедоступная схема'
        value={common}
        disabled={!isEditable}
        onChange={event => setCommon(event.target.checked)}
      />
      
      <div className='flex items-center justify-between gap-1 py-2 mt-2'>
        <SubmitButton text='Сохранить изменения' loading={processing} disabled={!isEditable || processing} />
        <div className='flex justify-end gap-1'>
          <Button 
            disabled={processing}
            tooltip='Скачать TRS файл'
            icon={<DownloadIcon />}
            loading={processing}
            onClick={handleDownload}
          />
          <a href={fileURL} download={fileName} className='hidden' ref={fileRef}>
            <i aria-hidden="true"/>
          </a>
          <Button 
            tooltip={isClaimable ? 'Стать владельцем' : 'Вы уже являетесь владельцем' }
            disabled={!isClaimable || processing}
            icon={<CrownIcon />}
            colorClass='text-green-400 dark:text-green-500'
            onClick={handleClaimOwner}
          />
          <Button 
            tooltip={ isEditable ? 'Удалить схему' : 'Вы не можете редактировать данную схему'}
            disabled={!isEditable || processing}
            icon={<DumpBinIcon />}
            colorClass='text-red-400 dark:text-red-600'
            loading={processing}
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
        <span className='ml-2'>{new Date(schema!.time_update).toLocaleString(intl.locale)}</span>
      </div>
      <div className='flex justify-start mt-2'>
        <label className='font-semibold'>Дата создания:</label>
        <span className='ml-8'>{new Date(schema!.time_create).toLocaleString(intl.locale)}</span>
      </div>      
    </form>
  );
}

export default RSFormCard;