'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { AccessPolicy, LibraryItemType, LocationHead } from '@/domain/library';
import { formatZodErrorMessage, useTx } from '@/i18n';

import { urls, useConceptNavigation } from '@/app';

import { Button, MiniButton, SubmitButton } from '@/components/control';
import { Label, TextArea, TextInput } from '@/components/input';

import { type CreateLibraryItemDTO, schemaCreateLibraryItem } from '../../backend/types';
import { useCreateItem } from '../../backend/use-create-item';
import { useLibrary } from '../../backend/use-library';
import { IconItemVisibility } from '../../components/icon-item-visibility';
import { PickLocation } from '../../components/pick-location';
import { PickSchema } from '../../components/pick-schema';
import { SelectAccessPolicy } from '../../components/select-access-policy';
import { useLibrarySearchStore } from '../../stores/library-search';

interface FormCreateItemProps {
  modelFrom?: number;
  initialType?: Extract<LibraryItemType, 'rsform' | 'rsmodel' | 'oss'>;
}

export function FormCreateItem({ modelFrom, initialType = LibraryItemType.RSFORM }: FormCreateItemProps) {
  const tx = useTx();
  const router = useConceptNavigation();
  const { createItem, isPending, reset: clearServerError } = useCreateItem();
  const { items } = useLibrary();
  const schemaItem = modelFrom ? items.find(item => item.id === modelFrom) : null;

  const searchLocation = useLibrarySearchStore(state => state.location);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);

  const defaultValues: CreateLibraryItemDTO = {
    item_type: modelFrom ? LibraryItemType.RSMODEL : initialType,
    access_policy: AccessPolicy.PUBLIC,
    visible: true,
    read_only: false,
    schema: modelFrom,
    title: schemaItem ? tx('semantic.term.model.short') + ' ' + schemaItem.title : undefined,
    alias: schemaItem ? `M${schemaItem.alias}` : undefined,
    location: schemaItem
      ? schemaItem.location
      : !!searchLocation && !searchLocation.startsWith(LocationHead.LIBRARY)
        ? searchLocation
        : LocationHead.USER,
    description: ''
  };
  const form = useForm({
    defaultValues,
    validators: {
      onChange: schemaCreateLibraryItem
    },
    onSubmit: async ({ value }) => {
      const newItem = await createItem(value);
      setSearchLocation(value.location);
      switch (newItem.item_type) {
        case LibraryItemType.RSFORM:
          router.push({ path: urls.schema(newItem.id), force: true });
          break;
        case LibraryItemType.OSS:
          router.push({ path: urls.oss(newItem.id), force: true });
          break;
        case LibraryItemType.RSMODEL:
          router.push({ path: urls.model(newItem.id), force: true });
          break;
      }
    }
  });

  const itemType = useStore(form.store, state => state.values.item_type);

  function resetErrors() {
    clearServerError();
  }

  function handleCancel() {
    if (router.canBack()) {
      router.back();
    } else {
      router.push({ path: urls.library });
    }
  }

  return (
    <form
      className='cc-column w-140 mx-auto px-6 py-3'
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      onChange={resetErrors}
    >
      <h1 className='select-none relative'>
        {itemType === LibraryItemType.RSMODEL
          ? tx('lib.create.pageTitleModel')
          : itemType === LibraryItemType.OSS
            ? tx('lib.create.pageTitleOss')
            : tx('ui.oss.newSchema')}
      </h1>

      <form.Field name='title'>
        {field => (
          <TextInput
            id='schema_title'
            placeholder={tx('semantic.term.title')}
            value={field.state.value ?? ''}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
          />
        )}
      </form.Field>

      <div className='flex justify-between gap-3'>
        <form.Field name='alias'>
          {field => (
            <TextInput
              id='schema_alias'
              label={tx('semantic.term.alias')}
              className='w-84'
              value={field.state.value ?? ''}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
            />
          )}
        </form.Field>

        <div className='flex flex-col gap-2'>
          <Label text={tx('semantic.term.access')} className='self-center select-none' />
          <div className='ml-auto cc-icons'>
            <form.Field name='access_policy'>
              {field => (
                <SelectAccessPolicy
                  value={field.state.value ?? AccessPolicy.PUBLIC}
                  onChange={field.handleChange}
                  stretchLeft
                />
              )}
            </form.Field>
            <form.Field name='visible'>
              {field => (
                <MiniButton
                  title={field.state.value ? tx('lib.item.visible.on') : tx('lib.item.visible.off')}
                  aria-label={tx('lib.item.visible.hint')}
                  icon={<IconItemVisibility value={field.state.value ?? true} />}
                  onClick={() => field.handleChange(!field.state.value)}
                />
              )}
            </form.Field>
          </div>
        </div>
      </div>

      {itemType === LibraryItemType.RSMODEL ? (
        <div>
          <Label text={tx('semantic.term.schema')} />
          <form.Field name='schema'>
            {field => (
              <PickSchema
                items={items}
                itemType={LibraryItemType.RSFORM}
                value={field.state.value ?? null}
                onChange={field.handleChange}
                rows={6}
                className='mt-2'
                error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
              />
            )}
          </form.Field>
        </div>
      ) : null}

      <form.Field name='location'>
        {field => (
          <PickLocation
            value={field.state.value ?? ''}
            rows={2}
            onChange={field.handleChange}
            error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
          />
        )}
      </form.Field>

      <form.Field name='description'>
        {field => (
          <TextArea
            id='schema_comment'
            label={tx('semantic.term.description')}
            placeholder={tx('labels.placeholder.itemDescription')}
            value={field.state.value ?? ''}
            onChange={event => field.handleChange(event.target.value)}
            rows={5}
            onBlur={field.handleBlur}
            error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
          />
        )}
      </form.Field>

      <div className='flex justify-around gap-6 py-3'>
        <SubmitButton
          text={itemType === LibraryItemType.RSMODEL ? tx('ui.action.createModel') : tx('ui.action.createSchema')}
          loading={isPending}
          className='min-w-40'
        />
        <Button text={tx('semantic.action.cancel')} className='min-w-40' onClick={handleCancel} />
      </div>
    </form>
  );
}
