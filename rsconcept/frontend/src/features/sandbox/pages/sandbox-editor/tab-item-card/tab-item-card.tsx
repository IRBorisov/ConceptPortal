'use client';

import { useEffect, useEffectEvent } from 'react';
import { useIntl } from 'react-intl';
import { useForm, useStore } from '@tanstack/react-form';
import clsx from 'clsx';

import { schemaUpdateLibraryItem, type UpdateLibraryItemDTO } from '@/features/library';
import { useRSModelEdit } from '@/features/rsmodel/pages/rsmodel-page/rsmodel-context';
import { CardRSModelStats } from '@/features/rsmodel/pages/rsmodel-page/tab-model-card/rsmodel-stats';
import { useSandboxBundle } from '@/features/sandbox/context/bundle-context';

import { SubmitButton } from '@/components/control';
import { IconDateCreate, IconDateUpdate, IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { ValueIcon } from '@/components/view';
import { LibraryItemType, type RSModel } from '@/domain/library';
import { calculateModelStats } from '@/domain/library/rsmodel-api';
import { useWindowSize } from '@/hooks/use-window-size';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';
import { withPreventDefault } from '@/utils/utils';

function modelDefaults(model: RSModel): UpdateLibraryItemDTO {
  return {
    id: model.id,
    item_type: LibraryItemType.RSMODEL,
    title: model.title,
    alias: model.alias,
    description: model.description,
    visible: model.visible,
    read_only: model.read_only
  };
}

const SIDELIST_LAYOUT_THRESHOLD = 768;

export function TabItemCard() {
  const intl = useIntl();
  const { model, engine, schema } = useRSModelEdit();
  const { updateLibraryItem } = useSandboxBundle();
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const windowSize = useWindowSize();
  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;
  const stats = calculateModelStats(schema, engine);

  const form = useForm({
    defaultValues: modelDefaults(model),
    validators: {
      onChange: schemaUpdateLibraryItem
    },
    onSubmit: ({ value, formApi }) => {
      updateLibraryItem(value);
      formApi.reset(value);
    }
  });

  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);
  const onResetEvent = useEffectEvent((next: UpdateLibraryItemDTO) => form.reset(next));
  const canSubmit = useStore(form.store, state => state.isValid);

  useEffect(
    function resetFormOnModelChange() {
      onResetEvent(modelDefaults(model));
    },
    [model]
  );

  useEffect(
    function syncGlobalModified() {
      onModifiedEvent(!isDefaultValue);
    },
    [isDefaultValue]
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.ctrlKey || event.metaKey) {
      if (event.code === 'KeyS') {
        return withPreventDefault(() => void form.handleSubmit())(event);
      }
    }
  }

  return (
    <div
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={clsx(
        'relative md:w-fit md:max-w-fit max-w-136',
        'flex px-6 pt-8',
        isNarrow && 'flex-col md:items-center'
      )}
    >
      <form
        id={globalIDs.library_item_editor}
        className='mt-2 min-w-88 sm:w-120 flex flex-col mx-0 md:mx-auto'
        onSubmit={event => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name='title'>
          {field => (
            <TextInput
              id='sandbox_model_title'
              label='Название'
              className='mb-3'
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>

        <form.Field name='alias'>
          {field => (
            <TextInput
              dense
              id='sandbox_model_alias'
              label='Сокращение'
              className='w-full mb-3'
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>

        <form.Field name='description'>
          {field => (
            <TextArea
              id='sandbox_model_description'
              label='Описание'
              rows={3}
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>

        <div className='mt-3 sm:mb-1 flex justify-between items-center'>
          <ValueIcon
            title='Дата обновления'
            dense
            icon={<IconDateUpdate size='1.25rem' />}
            value={new Date(model.time_update).toLocaleString(intl.locale)}
          />

          <SubmitButton
            text='Сохранить'
            className='self-center'
            loading={false}
            icon={<IconSave size='1.25rem' />}
            disabled={isDefaultValue || !canSubmit}
          />

          <ValueIcon
            title='Дата создания'
            dense
            icon={<IconDateCreate size='1.25rem' />}
            value={new Date(model.time_create).toLocaleString(intl.locale, {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit'
            })}
          />
        </div>
      </form>

      <aside className='w-80 md:w-56 mt-3 mx-auto md:ml-5 md:mr-0 max-w-full'>
        <CardRSModelStats stats={stats} />
      </aside>
    </div>
  );
}
