'use client';

import clsx from 'clsx';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { IconOSS, IconSave } from '@/components/Icons';
import SelectVersion from '@/components/select/SelectVersion';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import useDropdown from '@/hooks/useDropdown';
import { ILibraryUpdateData, LibraryItemType } from '@/models/library';
import { limits, patterns, prefixes } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';
import ToolbarItemAccess from './ToolbarItemAccess';
import ToolbarVersioning from './ToolbarVersioning';

interface FormRSFormProps {
  id?: string;
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
}

function FormRSForm({ id, isModified, setIsModified }: FormRSFormProps) {
  const controller = useRSEdit();
  const schema = controller.schema;

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [visible, setVisible] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const ossMenu = useDropdown();

  useEffect(() => {
    if (!schema) {
      setIsModified(false);
      return;
    }
    setIsModified(
      schema.title !== title ||
        schema.alias !== alias ||
        schema.comment !== comment ||
        schema.visible !== visible ||
        schema.read_only !== readOnly
    );
    return () => setIsModified(false);
  }, [
    schema,
    schema?.title,
    schema?.alias,
    schema?.comment,
    schema?.visible,
    schema?.read_only,
    title,
    alias,
    comment,
    visible,
    readOnly,
    setIsModified
  ]);

  useLayoutEffect(() => {
    if (schema) {
      setTitle(schema.title);
      setAlias(schema.alias);
      setComment(schema.comment);
      setVisible(schema.visible);
      setReadOnly(schema.read_only);
    }
  }, [schema]);

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    const data: ILibraryUpdateData = {
      item_type: LibraryItemType.RSFORM,
      title: title,
      alias: alias,
      comment: comment,
      visible: visible,
      read_only: readOnly
    };
    controller.updateSchema(data);
  };

  const ossSelector = useMemo(
    () =>
      schema && schema?.oss.length > 0 ? (
        <Overlay position='left-[12.5rem] top-[-0.4rem]'>
          <div ref={ossMenu.ref}>
            <MiniButton
              icon={<IconOSS size='1.25rem' className='icon-primary' />}
              noHover
              title='Связанные операционные схемы'
              hideTitle={ossMenu.isOpen}
              onClick={() => ossMenu.toggle()}
            />
            <Dropdown isOpen={ossMenu.isOpen} className='mt-[-0.1rem]'>
              <Label text='Список ОСС' className='border-b px-3' />
              {schema.oss.map((reference, index) => (
                <DropdownButton
                  className='min-w-[5rem]'
                  key={`${prefixes.oss_list}${index}`}
                  text={reference.alias}
                  onClick={event => controller.viewOSS(reference.id, event.ctrlKey || event.metaKey)}
                />
              ))}
            </Dropdown>
          </div>
        </Overlay>
      ) : null,
    [schema, ossMenu, controller]
  );

  return (
    <form id={id} className={clsx('mt-1 min-w-[22rem] sm:w-[30rem]', 'flex flex-col pt-1')} onSubmit={handleSubmit}>
      <TextInput
        id='schema_title'
        required
        label='Полное название'
        className='mb-3'
        value={title}
        disabled={!controller.isContentEditable}
        onChange={event => setTitle(event.target.value)}
      />
      {ossSelector}
      <div className='flex justify-between w-full gap-3 mb-3'>
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
          <ToolbarVersioning blockReload={schema && schema?.oss.length > 0} />
          <ToolbarItemAccess
            visible={visible}
            toggleVisible={() => setVisible(prev => !prev)}
            readOnly={readOnly}
            toggleReadOnly={() => setReadOnly(prev => !prev)}
            controller={controller}
          />
          <Label text='Версия' className='mb-2 select-none' />
          <SelectVersion
            id='schema_version'
            className='select-none'
            value={schema?.version} // prettier: split lines
            items={schema?.versions}
            onSelectValue={controller.viewVersion}
          />
        </div>
      </div>

      <TextArea
        id='schema_comment'
        label='Описание'
        rows={3}
        value={comment}
        disabled={!controller.isContentEditable || controller.isProcessing}
        onChange={event => setComment(event.target.value)}
      />
      {controller.isContentEditable || isModified ? (
        <SubmitButton
          text='Сохранить изменения'
          className='self-center mt-4'
          loading={controller.isProcessing}
          disabled={!isModified}
          icon={<IconSave size='1.25rem' />}
        />
      ) : null}
    </form>
  );
}

export default FormRSForm;
