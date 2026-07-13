import { useTx } from '@/i18n';

import { IconCrucialValue } from '@/features/rsform/components/icon-crucial-value';
import { IconEdgeType } from '@/features/rsform/components/icon-edge-type';
import { IconGraphMode } from '@/features/rsform/components/icon-graph-mode';
import { InteractionMode, TGEdgeType } from '@/features/rsform/stores/term-graph';

import { Divider } from '@/components/container';
import {
  IconChild,
  IconClustering,
  IconContextSelection,
  IconCrucial,
  IconDestroy,
  IconEdit,
  IconFilter,
  IconFitImage,
  IconFocus,
  IconGraphCollapse,
  IconGraphCore,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphMaximize,
  IconGraphOutputs,
  IconGroupSelection,
  IconImage,
  IconNewItem,
  IconOSS,
  IconOverviewCore,
  IconPredecessor,
  IconReset,
  IconText,
  IconTypeGraph
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpSchemaGraphEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.termGraph')}</h1>
      <div className='flex flex-col sm:flex-row'>
        <div className='sm:w-75'>
          <h2>Graph settings</h2>
          <ul>
            <li>Color – node coloring</li>
            <li>
              Links – choose <LinkTopic text='relation' topic={HelpTopic.CC_RELATIONS} /> types
            </li>
            <li>
              <IconFilter className='inline-icon' /> Open settings
            </li>
            <li>
              <IconFocus className='inline-icon' /> Set focus
            </li>
            <li>
              <IconOverviewCore className='inline-icon icon-green' /> <kbd>O</kbd> –{' '}
              <LinkTopic text='axiomatic core' topic={HelpTopic.CC_SYSTEM} /> only (schema overview)
            </li>
            <li>
              <IconFitImage className='inline-icon' /> Fit to screen
            </li>
            <li>
              <IconText className='inline-icon' /> Text display
            </li>
            <li>
              <IconClustering className='inline-icon' /> Hide generated
            </li>
            <li>
              <IconTypeGraph className='inline-icon' /> Open{' '}
              <LinkTopic text='type graph' topic={HelpTopic.UI_TYPE_GRAPH} />
            </li>
            <li>
              <IconImage className='inline-icon' /> Save image
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3 mt-3' className='hidden sm:block' />

        <div className='sm:w-75'>
          <h2>Node editing</h2>
          <ul>
            <li>Click on a node to select it</li>
            <li>Left click – focus constituent</li>
            <li>
              <IconReset className='inline-icon' /> <kbd>Esc</kbd> – clear selection
            </li>
            <li>
              <IconEdit className='inline-icon' /> Double click – edit
            </li>
            <li>
              <IconCrucialValue value={true} className='inline-icon' /> <kbd>F</kbd> – toggle key status
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> <kbd>Delete</kbd> – delete selected
            </li>
            <li>
              <IconNewItem className='inline-icon icon-green' /> New with links to selected
            </li>
          </ul>
        </div>
      </div>

      <Divider margins='my-3' className='hidden sm:block' />

      <div className='flex flex-col-reverse mb-3 sm:flex-row'>
        <div className='sm:w-75'>
          <h2>General</h2>
          <ul>
            <li>
              <kbd>Space</kbd> – pan the view
            </li>
            <li>
              <kbd>WASD</kbd> - directional navigation
            </li>
            <li>
              <IconOSS className='inline-icon' /> navigate to the associated{' '}
              <LinkTopic text='OSS' topic={HelpTopic.CC_OSS} />
            </li>
            <li>
              <IconGraphMode value={InteractionMode.explore} className='inline-icon' /> View graph
            </li>
            <li>
              <IconGraphMode value={InteractionMode.edit} className='inline-icon icon-green' /> Edit relations
            </li>
            <li>
              <IconEdgeType value={TGEdgeType.attribution} className='inline-icon' /> Attribution
            </li>
            <li>
              <IconEdgeType value={TGEdgeType.definition} className='inline-icon' /> Definition
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3' className='hidden sm:block' />

        <div className='dense w-75'>
          <h2>Selection</h2>
          <ul>
            <li>
              <IconContextSelection className='inline-icon' /> select related...
            </li>
            <li>
              <IconGraphCollapse className='inline-icon' /> all influencing
            </li>
            <li>
              <IconGraphExpand className='inline-icon' /> all dependent
            </li>
            <li>
              <IconGraphMaximize className='inline-icon' /> dependent only on selected
            </li>
            <li>
              <IconGraphInputs className='inline-icon' /> direct inputs
            </li>
            <li>
              <IconGraphOutputs className='inline-icon' /> direct outputs
            </li>
            <li>
              <IconGroupSelection className='inline-icon' /> select groups...
            </li>
            <li>
              <IconGraphCore className='inline-icon' /> select <LinkTopic text='Core' topic={HelpTopic.CC_SYSTEM} />
            </li>
            <li>
              <IconCrucial className='inline-icon' /> select key constituents
            </li>
            <li>
              <IconPredecessor className='inline-icon' /> select{' '}
              <LinkTopic text='own' topic={HelpTopic.CC_PROPAGATION} />
            </li>
            <li>
              <IconChild className='inline-icon' /> select{' '}
              <LinkTopic text='inherited' topic={HelpTopic.CC_PROPAGATION} />
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
