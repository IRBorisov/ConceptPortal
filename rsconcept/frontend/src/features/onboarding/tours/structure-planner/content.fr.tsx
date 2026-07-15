import { HelpTopic } from '@/features/help';

import { IconNewItem, IconReset, IconSave } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';

export const structurePlannerContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Planificateur de structure',
    body: (
      <p>
        Le <TourHelpLink text='planificateur de structure' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> construit un graphe
        d&apos;opérations à partir de la typification de la constituante ouverte (projections, somme d&apos;ensembles,
        etc.). Cliquez sur un nœud pour travailler sur cet élément structurel.
      </p>
    )
  },
  panel: {
    title: 'Définition, terme et enregistrement',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Le panneau supérieur affiche la définition formelle du nœud, son alias (vert s&apos;il est nouveau) et le
          champ terme avec références textuelles. Les constituantes existantes chargent leur terme ; les nœuds vides
          reçoivent un nom suggéré.
        </p>
        <p>
          En édition, <IconSave className='inline-icon icon-primary' /> /{' '}
          <IconNewItem className='inline-icon icon-green' /> enregistre ou crée — depuis le champ terme,{' '}
          <kbd>{saveHotkey}</kbd> fait de même. <IconReset className='inline-icon icon-primary' /> annule les
          modifications non enregistrées.
        </p>
      </div>
    )
  }
};
