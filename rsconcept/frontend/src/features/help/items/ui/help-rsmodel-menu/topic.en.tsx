import { CstType } from '@/domain/library';
import { useTx } from '@/i18n';

import { IconCstType } from '@/features/rsform/components/icon-cst-type';

import {
  IconAdmin,
  IconAlert,
  IconCalculateAll,
  IconClone,
  IconDestroy,
  IconEdit2,
  IconEditor,
  IconGenerateNames,
  IconInlineSynthesis,
  IconLibrary,
  IconMenu,
  IconOwner,
  IconQR,
  IconReader,
  IconReplace,
  IconRSForm,
  IconSandbox,
  IconShare,
  IconSortList,
  IconTemplates
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSModelMenuEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.model.edit')}</h1>
      <p>
        When navigating to an individual conceptual model, the model menu and a set of tabs appear at the top for
        viewing attributes, contents, and data. Available commands depend on the user's rights, access mode, and model
        state.
      </p>

      <p>Some actions may be unavailable in anonymous mode or without editing rights.</p>

      <h2>{tx('tx.general.tab.plural')}</h2>
      <ul>
        <li>
          <LinkTopic text='Passport' topic={HelpTopic.UI_MODEL_CARD} /> - model attributes and link to the conceptual
          schema
        </li>
        <li>
          <LinkTopic text='List' topic={HelpTopic.UI_MODEL_LIST} /> - tabular work with model constituents
        </li>
        <li>
          <LinkTopic text='Concept' topic={HelpTopic.UI_SCHEMA_EDITOR} /> – edit an individual{' '}
          <LinkTopic text='Constituent' topic={HelpTopic.CC_CONSTITUENTA} />
        </li>
        <li>
          <LinkTopic text='Graph' topic={HelpTopic.UI_GRAPH_TERM} /> – graphical view of constituent relationships
        </li>
        <li>
          <LinkTopic text='Data' topic={HelpTopic.UI_MODEL_VALUE} /> - input, view, and edit model values
        </li>
        <li>
          <LinkTopic text='Evaluation' topic={HelpTopic.UI_MODEL_EVALUATOR} /> - check and compute arbitrary expressions
        </li>
      </ul>

      <h2>{tx('tx.model.menu')}</h2>
      <ul>
        <li>
          <IconMenu size='1.25rem' className='inline-icon' /> Model menu - drop-down menu with general functions
        </li>
        <li>
          <IconCalculateAll className='inline-icon icon-green' /> Recompute model - recalculate all computations
        </li>
        <li>
          <IconShare className='inline-icon icon-primary' /> Share - copy public link to the model
        </li>
        <li>
          <IconQR className='inline-icon icon-primary' /> QR code - show QR code for the model page
        </li>
        <li>
          <IconClone className='inline-icon icon-green' /> Clone - create a copy of the model
        </li>
        <li>
          <IconSandbox className='inline-icon icon-green' /> Open in sandbox - duplicate model to the sandbox
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> Delete model - remove the model from the library
        </li>
        <li>
          <IconRSForm className='inline-icon icon-primary' /> Go to schema - navigate to the conceptual schema
        </li>
        <li>
          <IconLibrary className='inline-icon icon-primary' /> Library - navigate to the library
        </li>
      </ul>

      <h2>{tx('tx.general.editing')}</h2>
      <ul>
        <li>
          <IconEdit2 size='1.25rem' className='inline-icon' /> Operations are described in detail in the{' '}
          <LinkTopic text='Explication section' topic={HelpTopic.RSL_OPERATIONS} />.
        </li>
        <li>
          <IconTemplates size='1.25rem' className='inline-icon' /> Generate constituents from expression templates
        </li>
        <li>
          <IconInlineSynthesis size='1.25rem' className='inline-icon' /> Insert constituents from another schema
        </li>
        <li>
          <IconCstType value={CstType.NOMINAL} size='1.25rem' className='inline-icon' /> Enable attribution form
        </li>
        <li>
          <IconSortList size='1.25rem' className='inline-icon' /> Sort constituents
        </li>
        <li>
          <IconGenerateNames size='1.25rem' className='inline-icon' /> Renumber constituents in the order of declaration
        </li>
        <li>
          <IconReplace size='1.25rem' className='inline-icon' /> Identify constituents of the current schema
        </li>
      </ul>

      <h2>{tx('tx.general.role.plural')}</h2>
      <ul>
        <li>
          <IconAlert size='1.25rem' className='inline-icon icon-red' /> working in anonymous mode. Navigate to the login
          page
        </li>
        <li>
          <IconReader size='1.25rem' className='inline-icon' /> Reader mode
        </li>
        <li>
          <IconEditor size='1.25rem' className='inline-icon' /> Editor mode
        </li>
        <li>
          <IconOwner size='1.25rem' className='inline-icon' /> Owner mode
        </li>
        <li>
          <IconAdmin size='1.25rem' className='inline-icon' /> Administrator mode
        </li>
      </ul>
    </>
  );
}
