'use client';

import { type ReactNode, useState } from 'react';

import { CstType, type RSForm } from '@/domain/library';
import { isBaseSet, isBasicConcept } from '@/domain/library/rsform-api';
import { formatZodErrorMessage, useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';

import { MiniButton } from '@/components/control';
import { TextButton } from '@/components/control/text-button';
import { TextArea, TextInput } from '@/components/input';
import { type CreateFieldProps } from '@/utils/forms';

import { type CreateConstituentaDTO } from '../../backend/types';
import { IconCrucialValue } from '../../components/icon-crucial-value';
import { RefsInput } from '../../components/refs-input';
import { RSInput } from '../../components/rs-input';
import { SelectCstType } from '../../components/select-cst-type';
import { getRSDefinitionPlaceholder, labelRSExpression } from '../../labels';

export interface FormCreateCstFields {
  AliasField: (props: CreateFieldProps<string>) => ReactNode;
  TermRawField: (props: CreateFieldProps<string>) => ReactNode;
  DefinitionFormalField: (props: CreateFieldProps<string>) => ReactNode;
  DefinitionRawField: (props: CreateFieldProps<string>) => ReactNode;
  ConventionField: (props: CreateFieldProps<string>) => ReactNode;
}

interface FormCreateCstProps {
  schema: RSForm;
  values: CreateConstituentaDTO;
  fields: FormCreateCstFields;
  onChangeCstType: (target: CstType) => void;
  onToggleCrucial: () => void;
}

export function FormCreateCst({ schema, values, fields, onChangeCstType, onToggleCrucial }: FormCreateCstProps) {
  const tx = useTx();
  const [forceComment, setForceComment] = useState(false);
  const cst_type = values.cst_type ?? CstType.BASE;
  const convention = values.convention;
  const crucial = values.crucial;
  const isBasic = isBasicConcept(cst_type) || cst_type === CstType.NOMINAL;
  const isElementary = isBaseSet(cst_type);
  const showConvention = !!convention || forceComment || isBasic;
  const { AliasField, TermRawField, DefinitionFormalField, DefinitionRawField, ConventionField } = fields;

  return (
    <>
      <div className='flex items-center self-center gap-3'>
        <MiniButton
          title={tx('semantic.term.constituenta.crucial')}
          icon={<IconCrucialValue size='1.25rem' value={crucial} />}
          onClick={onToggleCrucial}
        />
        <SelectCstType id='dlg_cst_type' value={cst_type} onChange={onChangeCstType} />
        <AliasField>
          {field => (
            <TextInput
              id='dlg_cst_alias'
              dense
              label={tx('semantic.term.alias.short')}
              className='w-28'
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
            />
          )}
        </AliasField>
        <BadgeHelp topic={HelpTopic.CC_CONSTITUENTA} offset={16} contentClass='sm:max-w-160' />
      </div>

      <TermRawField>
        {field => (
          <RefsInput
            id='dlg_cst_term'
            label={tx('semantic.term.term')}
            maxHeight='3.75rem'
            placeholder={tx('ui.placeholder.termForDefinitions')}
            schema={schema}
            value={field.state.value ?? ''}
            resolved={field.state.value}
            onChange={newValue => field.handleChange(newValue)}
          />
        )}
      </TermRawField>
      <DefinitionFormalField>
        {field =>
          !!field.state.value || !isElementary ? (
            <RSInput
              id='dlg_cst_expression'
              portalHoverTooltips
              label={labelRSExpression(cst_type)}
              placeholder={getRSDefinitionPlaceholder(cst_type)}
              value={field.state.value ?? ''}
              onChange={field.handleChange}
              schema={schema}
            />
          ) : (
            <></>
          )
        }
      </DefinitionFormalField>
      <DefinitionRawField>
        {field =>
          !!field.state.value || !isElementary ? (
            <RefsInput
              id='dlg_cst_definition'
              label={tx('semantic.term.definitionTextual')}
              placeholder={tx('ui.placeholder.textDefinitionHint')}
              maxHeight='3.75rem'
              schema={schema}
              resolved={field.state.value}
              value={field.state.value ?? ''}
              onChange={newValue => field.handleChange(newValue)}
            />
          ) : (
            <></>
          )
        }
      </DefinitionRawField>

      {!showConvention ? (
        <TextButton
          text={tx('semantic.action.add.comment')}
          className='self-start'
          onClick={() => setForceComment(true)}
        />
      ) : (
        <ConventionField>
          {field => (
            <TextArea
              id='dlg_cst_convention'
              spellCheck
              fitContent
              label={isBasic ? tx('semantic.term.convention') : tx('semantic.term.comment')}
              placeholder={isBasic ? tx('ui.placeholder.conventionBasic') : tx('ui.placeholder.developerComment')}
              areaClassName='max-h-20'
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </ConventionField>
      )}
    </>
  );
}
