import { useTx } from '@/i18n';

import {
  IconClone,
  IconDestroy,
  IconEdit,
  IconGenerateNames,
  IconLeftOpen,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconRSForm,
  IconSortList,
  IconTree,
  IconTypeGraph
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpOssSidebarEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.sidebar.contents')}</h1>
      <p className='m-0'>
        <IconLeftOpen className='inline-icon' />
        {'\u2009'} The OSS sidebar allows you to quickly edit the contents of a{' '}
        <LinkTopic text='Conceptual Schema' topic={HelpTopic.CC_SYSTEM} /> without navigating to it directly.
      </p>
      <p className='mt-1'>
        The top part of the sidebar lets you filter the constituent list similarly to the{' '}
        <LinkTopic text='constituent editor' topic={HelpTopic.UI_SCHEMA_EDITOR} />.
      </p>
      <ul>
        <li>
          <IconRSForm className='inline-icon' /> conceptual schema edit menu
        </li>
        <li>
          <IconSortList className='inline-icon' /> sort constituents
        </li>
        <li>
          <IconGenerateNames className='inline-icon' /> renumber
        </li>
        <li>
          <IconEdit className='inline-icon' /> edit constituents
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> new constituent
        </li>
        <li>
          <IconClone className='inline-icon icon-green' /> clone constituent
        </li>
        <li>
          <IconDestroy className='inline-icon icon-red' /> delete constituents
        </li>
        <li>
          <IconMoveDown className='inline-icon' />
          <IconMoveUp className='inline-icon' /> move up/down
        </li>
        <li>
          <IconTree className='inline-icon' />
          {'\u2009'}
          <LinkTopic text='term graph' topic={HelpTopic.UI_GRAPH_TERM} />
        </li>
        <li>
          <IconTypeGraph className='inline-icon' />
          {'\u2009'}
          <LinkTopic text='type graph' topic={HelpTopic.UI_TYPE_GRAPH} />
        </li>
      </ul>
    </>
  );
}
