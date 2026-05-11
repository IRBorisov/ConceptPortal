import { CstType } from '@/domain/library';
import { useTx } from '@/i18n';

import { IconCstType } from '@/features/rsform/components/icon-cst-type';

import {
  IconAdmin,
  IconAlert,
  IconArchive,
  IconClone,
  IconDestroy,
  IconDownload,
  IconEdit2,
  IconEditor,
  IconGenerateNames,
  IconInlineSynthesis,
  IconMenu,
  IconOwner,
  IconPDF,
  IconQR,
  IconReader,
  IconReplace,
  IconRSModel,
  IconSandbox,
  IconShare,
  IconSortList,
  IconTemplates,
  IconUpload
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpSchemaMenuEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.schema.edit')}</h1>
      <p>
        When navigating to an individual conceptual schema, a menu appears at the top containing buttons with drop-down
        menus and a set of tabs. The appearance and number of buttons depends on the selected access mode.
      </p>

      <h2>{tx('tx.general.tab.plural')}</h2>
      <ul>
        <li>
          <LinkTopic text='Passport' topic={HelpTopic.UI_SCHEMA_CARD} /> – edit schema attributes and version
        </li>
        <li>
          <LinkTopic text='List' topic={HelpTopic.UI_SCHEMA_LIST} /> – work with the constituent list in tabular form
        </li>
        <li>
          <LinkTopic text='Concept' topic={HelpTopic.UI_SCHEMA_EDITOR} /> – edit an individual{' '}
          <LinkTopic text='Constituent' topic={HelpTopic.CC_CONSTITUENTA} />
        </li>
        <li>
          <LinkTopic text='Graph' topic={HelpTopic.UI_GRAPH_TERM} /> – graphical view of constituent relationships
        </li>
      </ul>

      <h2>{tx('tx.schema.menu')}</h2>
      <ul>
        <li>
          <IconMenu size='1.25rem' className='inline-icon' /> Schema menu – drop-down menu with general functions
        </li>
        <li>
          <IconShare className='inline-icon' /> Share – copy a link to the schema
        </li>
        <li>
          <IconQR className='inline-icon' /> Show QR code for the schema
        </li>
        <li>
          <IconClone className='inline-icon icon-green' /> Clone – create a copy of the schema
        </li>
        <li>
          <IconRSModel className='inline-icon icon-green' /> Create model – create a model based on the schema
        </li>
        <li>
          <IconSandbox className='inline-icon icon-green' /> Open in sandbox – open the schema in the sandbox editor for
          local experiments
        </li>
        <li>
          <IconPDF className='inline-icon' /> Export to PDF – save as a PDF file
        </li>
        <li>
          <IconDownload className='inline-icon' /> Download – save in Exteor format
        </li>
        <li>
          <IconUpload className='inline-icon icon-red' /> Upload – replace the schema with the contents of an Exteor
          file
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> Delete – removes the schema from the Portal database
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
          <IconArchive size='1.25rem' className='inline-icon' /> viewing an archived version. Navigate to the current
          version
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
