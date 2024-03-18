'use client';

import clsx from 'clsx';
import { useEffect, useLayoutEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { LuGitBranchPlus, LuPencilLine } from 'react-icons/lu';
import { toast } from 'react-toastify';

import HelpButton from '@/components/Help/HelpButton';
import Checkbox from '@/components/ui/Checkbox';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import VersionSelector from '@/components/VersionSelector';
import { useAuth } from '@/context/AuthContext';
import { useRSForm } from '@/context/RSFormContext';
import { LibraryItemType } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { IRSFormCreateData } from '@/models/rsform';
import { classnames, limits, patterns } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';

interface FormRSFormProps {
  id?: string;
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
}

function FormRSForm({ id, isModified, setIsModified }: FormRSFormProps) {
  const { schema, update, processing } = useRSForm();
  const { user } = useAuth();
  const controller = useRSEdit();

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);
  const [canonical, setCanonical] = useState(false);

  useEffect(() => {
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
  }, [
    schema,
    schema?.title,
    schema?.alias,
    schema?.comment,
    schema?.is_common,
    schema?.is_canonical,
    title,
    alias,
    comment,
    common,
    canonical,
    setIsModified
  ]);

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

  return (
    <form
      id={id}
      className={clsx('mt-1 min-w-[22rem] sm:w-[30rem]', 'py-1', classnames.flex_col)}
      onSubmit={handleSubmit}
    >
      <TextInput
        id='schema_title'
        required
        label='Полное название'
        value={title}
        disabled={!controller.isContentEditable}
        onChange={event => setTitle(event.target.value)}
      />
      <div className='flex justify-between w-full gap-3'>
        <TextInput
          id='schema_alias'
          required
          label='Сокращение'
          className='w-[14rem]'
          pattern={patterns.library_alias}
          title={`не более ${limits.library_alias_len} символов`}
          disabled={!controller.isContentEditable}
          value={alias}
          onChange={event => setAlias(event.target.value)}
        />
        <div className='flex flex-col'>
          <Overlay position='top-[-0.25rem] right-[-0.25rem] flex'>
            {controller.isMutable || controller.isProcessing ? (
              <>
                <MiniButton
                  noHover
                  title={controller.isContentEditable ? 'Создать версию' : 'Переключитесь на актуальную версию'}
                  disabled={!controller.isContentEditable}
                  onClick={controller.createVersion}
                  icon={<LuGitBranchPlus size='1.25rem' className='icon-green' />}
                />
                <MiniButton
                  noHover
                  title='Редактировать версии'
                  disabled={!schema || schema?.versions.length === 0}
                  onClick={controller.editVersions}
                  icon={<LuPencilLine size='1.25rem' className='icon-primary' />}
                />
              </>
            ) : null}
            <HelpButton topic={HelpTopic.VERSIONS} className='max-w-[30rem]' offset={4} />
          </Overlay>
          <Label text='Версия' className='mb-2' />
          <VersionSelector
            value={schema?.version} // prettier: split lines
            items={schema?.versions}
            onSelectValue={controller.viewVersion}
          />
        </div>
      </div>
      <TextArea
        id='schema_comment'
        label='Комментарий'
        rows={3}
        value={comment}
        disabled={!controller.isContentEditable}
        onChange={event => setComment(event.target.value)}
      />
      <div className='flex justify-between whitespace-nowrap'>
        <Checkbox
          id='schema_common'
          label='Общедоступная схема'
          title='Общедоступные схемы видны всем пользователям и могут быть изменены'
          disabled={!controller.isContentEditable}
          value={common}
          setValue={value => setCommon(value)}
        />
        <Checkbox
          id='schema_immutable'
          label='Неизменная схема'
          title='Только администраторы могут присваивать схемам неизменный статус'
          disabled={!controller.isContentEditable || !user?.is_staff}
          value={canonical}
          setValue={value => setCanonical(value)}
        />
      </div>
      {controller.isContentEditable || controller.isProcessing ? (
        <SubmitButton
          text='Сохранить изменения'
          className='self-center'
          loading={processing}
          disabled={!isModified || controller.isProcessing}
          icon={<FiSave size='1.25rem' />}
        />
      ) : null}
    </form>
  );
}

export default FormRSForm;
