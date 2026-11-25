'use client';

import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';

import { type AppLocale, localeLabel, SUPPORTED_LOCALES, useTx } from '@/i18n';
import { Grammeme } from '@rsconcept/domain/cctext/language';
import { type Constituenta, CstType, LocationHead } from '@rsconcept/domain/library';
import { type RelativizationProjection } from '@rsconcept/domain/library/relativization';

import { useConceptNavigation } from '@/app';
import { useAuth } from '@/features/auth/backend/use-auth';
import { HelpTopic } from '@/features/help';
import { useCreateFromSandbox } from '@/features/library/backend/use-create-from-sandbox';
import { canConfirmReview, prepareReview, type ReviewRow } from '@/features/oss/dialogs/relativization/review';
import { ReviewRelativizationTexts } from '@/features/oss/dialogs/relativization/review-texts';

import { KEYS } from '@/backend/configuration';
import { Checkbox, Label, TextArea, TextInput } from '@/components/input';
import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { limits } from '@/utils/constants';
import { extractErrorMessage } from '@/utils/utils';

import { rsformsApi } from '../../backend/api';
import { cctextApi } from '../../backend/cctext/api';
import { SelectConstituenta } from '../../components/select-constituenta';
import { useRsformDialogsStore } from '../rsform-dialog-store';

import { type RelativizationRequest } from './relativization.worker';

export interface DlgRelativizeProps {
  schemaID: number;
  initialTarget: number | null;
}

const kernelTypes = new Set<CstType>([CstType.BASE, CstType.CONSTANT, CstType.STRUCTURED]);
const contextNames: Record<AppLocale, string> = { en: 'context', fr: 'contexte', ru: 'контекст' };

async function calculateDraft(request: RelativizationRequest): Promise<RelativizationProjection | null> {
  const worker = new Worker(new URL('./relativization.worker.ts', import.meta.url), { type: 'module' });
  try {
    return await new Promise<RelativizationProjection | null>((resolve, reject) => {
      worker.onmessage = ({ data }: MessageEvent<RelativizationProjection | null>) => resolve(data);
      worker.onerror = reject;
      worker.onmessageerror = reject;
      worker.postMessage(request);
    });
  } finally {
    worker.terminate();
  }
}

export function DlgRelativize() {
  const tx = useTx();
  const intl = useIntl();
  const router = useConceptNavigation();
  const { user } = useAuth();
  const { createRSFormFromSandbox } = useCreateFromSandbox({ reportErrorInDialog: true });
  const { schemaID, initialTarget } = useRsformDialogsStore(state => state.props as DlgRelativizeProps);
  const hideDialog = useRsformDialogsStore(state => state.hideDialog);
  const sourceQuery = useQuery(rsformsApi.getRSFormQueryOptions({ itemID: schemaID }));
  const source = sourceQuery.data?.raw;
  const schema = sourceQuery.data?.transformed;

  const [targetID, setTargetID] = useState(initialTarget);
  const [excludedIDs, setExcludedIDs] = useState<number[]>([]);
  const [manualTitle, setManualTitle] = useState<string | null>(null);
  const [alias, setAlias] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<AppLocale | null>(null);
  const [manualContext, setManualContext] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ projection: RelativizationProjection; sourceTime: string } | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const pendingRef = useRef(false);

  const targetOptions = (schema?.items ?? []).filter(
    item => item.cst_type === CstType.BASE || item.cst_type === CstType.STRUCTURED
  );
  const target = targetOptions.find(item => item.id === targetID) ?? null;
  const exclusionOptions = (schema?.items ?? []).filter(
    item => item.id !== target?.id && kernelTypes.has(item.cst_type)
  );
  const term = target?.term_resolved.trim() ?? '';
  const locale =
    language ?? (/\p{Script=Cyrillic}/u.test((schema?.title ?? '') + term) ? 'ru' : intl.locale === 'fr' ? 'fr' : 'en');
  const contextName = manualContext ?? contextNames[locale];
  const useInflection = intl.locale === 'ru' && !!term && manualTitle === null;
  const formQuery = useQuery({
    queryKey: [KEYS.cctext, 'inflect', term, Grammeme.gent],
    queryFn: ({ signal }) => cctextApi.inflect({ text: term, grams: Grammeme.gent }, signal),
    enabled: useInflection,
    retry: false
  });
  const inflected = useInflection ? formQuery.data?.result.trim() : '';
  const defaultTitle =
    schema && target
      ? tx('tx.oss.relativization.title', {
          source: schema.title || schema.alias,
          term: inflected || term || target.alias
        })
      : '';
  const title = manualTitle ?? defaultTitle;
  const canPrepare =
    !!source &&
    !!target &&
    !!alias.trim() &&
    !!title.trim() &&
    !!contextName.trim() &&
    !(useInflection && formQuery.isLoading);
  const sourceChanged = draft !== null && draft.sourceTime !== source?.time_update;
  const canConfirm = draft !== null && !sourceChanged && canConfirmReview(rows);

  function changeTarget(item: Constituenta | null) {
    setTargetID(item?.id ?? null);
    setExcludedIDs(previous => previous.filter(id => id !== item?.id));
  }

  async function submit() {
    if (pendingRef.current || !canPrepare || !source || !target || (reviewing && !canConfirm)) return;
    pendingRef.current = true;
    setPending(true);
    setErrorMessage('');
    try {
      if (!reviewing) {
        const projection = await calculateDraft({
          source: { items: source.items, attribution: source.attribution },
          options: {
            target: target.id,
            excluded: exclusionOptions.filter(item => excludedIDs.includes(item.id)).map(item => item.id),
            locale,
            contextName: contextName.trim()
          }
        });
        if (!projection) {
          setErrorMessage(tx('tx.oss.relativization.compute.fail'));
          return;
        }
        setRows(prepareReview(projection, rows));
        setDraft({ projection, sourceTime: source.time_update });
        setReviewing(true);
        return;
      }
      if (!draft) return;
      const reviewedFields = new Map(rows.map(row => [row.item.id, row.fields]));
      const result = await createRSFormFromSandbox({
        item_data: {
          title: title.trim(),
          alias: alias.trim(),
          description: description.trim(),
          visible: true,
          read_only: false,
          access_policy: source.access_policy,
          location:
            user.id === source.owner && source.location !== LocationHead.LIBRARY ? source.location : LocationHead.USER
        },
        schema_data: {
          items: draft.projection.items.map(item => {
            const fields = reviewedFields.get(item.id);
            return fields
              ? { ...item, ...fields, term_forms: fields.term_raw === item.term_raw ? item.term_forms : [] }
              : item;
          }),
          attribution: draft.projection.attribution
        }
      });
      hideDialog();
      router.gotoCstList(result.id);
    } catch (error) {
      setErrorMessage(
        reviewing && error instanceof Error ? extractErrorMessage(error) : tx('tx.oss.relativization.compute.fail')
      );
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <ModalForm
      header={tx('tx.oss.relativization')}
      submitText={tx(reviewing ? 'tx.oss.relativization.review.submit' : 'tx.oss.relativization.review.start')}
      canSubmit={!pending && canPrepare && (!reviewing || canConfirm)}
      beforeCancel={() => !pendingRef.current}
      closeOnSubmit={false}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void submit();
      }}
      className='w-200 px-6 min-h-64'
      helpTopic={HelpTopic.CC_RELATIVIZATION}
      openManualInNewTab
    >
      {errorMessage ? (
        <p className='pt-3 text-destructive' role='alert'>
          {errorMessage}
        </p>
      ) : null}
      {pending ? (
        <p className='pt-3' role='status'>
          {tx(reviewing ? 'tx.oss.relativization.review.saving' : 'tx.oss.relativization.review.previewing')}
        </p>
      ) : null}
      {sourceQuery.isPending ? <Loader /> : null}
      {sourceQuery.isError && !source ? <p role='alert'>{tx('tx.oss.relativization.source.fail')}</p> : null}
      {reviewing ? (
        <>
          {sourceChanged ? <p role='alert'>{tx('tx.oss.relativization.review.stale')}</p> : null}
          <ReviewRelativizationTexts
            rows={rows}
            onChange={row => setRows(current => current.map(item => (item.item.id === row.item.id ? row : item)))}
            back={() => {
              setErrorMessage('');
              setReviewing(false);
            }}
            disabled={pending}
          />
        </>
      ) : (
        <fieldset className='cc-column py-4' disabled={pending}>
          <div className='cc-column'>
            <Label text={tx('tx.oss.relativization.target')} htmlFor='relativization_target' />
            <SelectConstituenta
              id='relativization_target'
              items={targetOptions}
              placeholder={tx('tx.oss.relativization.target.select')}
              value={target}
              onChange={changeTarget}
            />
          </div>
          {exclusionOptions.length ? (
            <fieldset className='grid gap-1'>
              <legend>{tx('tx.oss.relativization.excluded')}</legend>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-36 overflow-auto'>
                {exclusionOptions.map(item => (
                  <Checkbox
                    key={item.id}
                    label={[item.alias, item.term_resolved].filter(Boolean).join(' — ')}
                    role='checkbox'
                    aria-checked={excludedIDs.includes(item.id)}
                    value={excludedIDs.includes(item.id)}
                    onChange={checked =>
                      setExcludedIDs(previous =>
                        checked ? [...previous, item.id] : previous.filter(id => id !== item.id)
                      )
                    }
                  />
                ))}
              </div>
            </fieldset>
          ) : null}
          <div className='grid gap-3 sm:grid-cols-2'>
            <TextInput
              id='relativization_context'
              label={tx('tx.oss.relativization.review.context.name')}
              value={contextName}
              maxLength={limits.len_title}
              onChange={event => setManualContext(event.target.value)}
            />
            <div className='cc-column'>
              <Label text={tx('tx.oss.relativization.review.language')} htmlFor='relativization_language' />
              <select
                id='relativization_language'
                className='cc-input'
                value={locale}
                onChange={event => setLanguage(event.target.value as AppLocale)}
              >
                {SUPPORTED_LOCALES.map(value => (
                  <option key={value} value={value}>
                    {localeLabel(value)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <TextInput
            id='relativization_title'
            label={tx('tx.lib.title')}
            value={title}
            maxLength={limits.len_title}
            onChange={event => setManualTitle(event.target.value)}
          />
          <TextInput
            id='relativization_alias'
            label={tx('tx.lib.alias')}
            value={alias}
            maxLength={limits.len_alias}
            onChange={event => setAlias(event.target.value)}
          />
          <TextArea
            id='relativization_description'
            label={tx('tx.lib.description')}
            value={description}
            maxLength={limits.len_description}
            rows={3}
            noResize
            onChange={event => setDescription(event.target.value)}
          />
        </fieldset>
      )}
    </ModalForm>
  );
}
