'use client';

import { useEffect, useEffectEvent } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import clsx from 'clsx';

import { LibraryItemType, schemaUpdateLibraryItem, type UpdateLibraryItemDTO } from '@/features/library';
import { type RSModel } from '@/features/rsmodel/models/rsmodel';
import { calculateModelStats } from '@/features/rsmodel/models/rsmodel-api';
import { useRSModelEdit } from '@/features/rsmodel/pages/rsmodel-page/rsmodel-context';
import { CardRSModelStats } from '@/features/rsmodel/pages/rsmodel-page/tab-model-card/rsmodel-stats';

import { SubmitButton } from '@/components/control';
import { IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { useWindowSize } from '@/hooks/use-window-size';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { sbApi } from '../../../backend/sandbox-mutations';
import { type SandboxBundle } from '../../../models/bundle';

interface TabItemCardProps {
  setBundle: React.Dispatch<React.SetStateAction<SandboxBundle | null>>;
}

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

export function TabItemCard({ setBundle }: TabItemCardProps) {
  const { model, engine, schema } = useRSModelEdit();
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
      setBundle(prev => {
        if (!prev) {
          return prev;
        }
        return sbApi.updateLibraryItem(prev, value);
      });
      formApi.reset(value);
    }
  });

  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);
  const onResetEvent = useEffectEvent((next: UpdateLibraryItemDTO) => form.reset(next));

  useEffect(function resetFormOnModelChange() {
    onResetEvent(modelDefaults(model));
  }, [model]);

  useEffect(function syncGlobalModified() {
    onModifiedEvent(!isDefaultValue);
  }, [isDefaultValue]);

  return (
    <div
      className={clsx(
        'relative md:w-fit md:max-w-fit max-w-136',
        'flex px-6 pt-8',
        isNarrow && 'flex-col md:items-center'
      )}
    >
      <div className='cc-column mx-0 md:mx-auto'>
        <form
          id={globalIDs.library_item_editor}
          className='mt-1 min-w-88 sm:w-120 flex flex-col pt-1'
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

          <div className='flex justify-between gap-3 mb-3'>
            <form.Field name='alias'>
              {field => (
                <TextInput
                  dense
                  id='sandbox_model_alias'
                  label='Сокращение'
                  className='w-full'
                  value={field.state.value}
                  onChange={event => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0]?.message}
                />
              )}
            </form.Field>
          </div>

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

          <SubmitButton
            text='Сохранить'
            className='self-center mt-4'
            loading={false}
            icon={<IconSave size='1.25rem' />}
            disabled={isDefaultValue}
          />
        </form>
      </div>

      <aside className='w-80 md:w-56 mt-3 mx-auto md:ml-5 md:mr-0 max-w-full'      >
        <CardRSModelStats stats={stats} />
      </aside>
    </div>
  );
}
