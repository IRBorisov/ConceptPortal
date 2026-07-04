'use client';

import { useTx } from '@/i18n';
import { CstType, type RSForm } from '@rsconcept/domain/library';
import { applyFilterCategory, isTemplateCst } from '@rsconcept/domain/library/rsform-api';

import { useTemplates } from '@/features/library/backend/use-templates';

import { TextArea } from '@/components/input';
import { ComboBox } from '@/components/input/combo-box';

import { PickConstituenta } from '../../components/pick-constituenta';
import { RSInput } from '../../components/rs-input';

import { useTemplateContext } from './template-context';

interface TabTemplateProps {
  schema: RSForm;
}

export function TabTemplate({ schema }: TabTemplateProps) {
  const tx = useTx();
  const {
    templateID, //
    filterCategory,
    prototype,
    templateSchema,
    onChangePrototype,
    onChangeTemplateID,
    onChangeFilterCategory
  } = useTemplateContext();

  const { templates } = useTemplates();
  const templateOptions = [{ ...schema, title: tx('tx.schema.current') }, ...templates];
  const selectedTemplate = templateOptions.find(item => item.id === templateID);

  const constituents = templateSchema?.items.filter(isTemplateCst) ?? [];
  const filteredData = !filterCategory ? constituents : applyFilterCategory(filterCategory, constituents);

  const prototypeInfo = !prototype
    ? ''
    : `${prototype?.term_raw}${prototype?.definition_raw ? ` — ${prototype?.definition_raw}` : ''}`;

  const categorySelector = !templateSchema
    ? []
    : templateSchema.items.filter(cst => cst.cst_type === CstType.STATEMENT);

  return (
    <div className='cc-fade-in'>
      <div className='flex gap-1 border-t border-x rounded-t-md bg-input'>
        <ComboBox
          value={selectedTemplate ?? null}
          items={templateOptions}
          noBorder
          noSearch
          placeholder={tx('tx.cst.template.source')}
          className='w-48'
          idFunc={item => String(item.id)}
          labelValueFunc={item => item.title}
          labelOptionFunc={item => item.title}
          onChange={item => onChangeTemplateID(item?.id ?? null)}
        />
        <ComboBox
          value={filterCategory}
          items={categorySelector}
          noBorder
          noSearch
          clearable
          placeholder={tx('tx.cst.template.category')}
          className='grow'
          idFunc={cst => String(cst.id)}
          labelValueFunc={cst => cst.term_raw}
          labelOptionFunc={cst => cst.term_raw}
          onChange={cst => onChangeFilterCategory(cst)}
        />
      </div>
      <PickConstituenta
        id='dlg_template_picker'
        value={prototype}
        items={filteredData}
        onChange={onChangePrototype}
        className='rounded-t-none'
        rows={8}
      />

      <TextArea id='dlg_template_term' disabled spellCheck className='my-3' rows={2} value={prototypeInfo} />
      <RSInput
        id='dlg_template_expression'
        disabled
        placeholder={tx('tx.cst.template.select')}
        height='5.1rem'
        value={prototype?.definition_formal}
      />
    </div>
  );
}
