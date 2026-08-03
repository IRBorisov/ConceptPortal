import { HelpTopic } from '@/features/help';
import { IconRelocationUp } from '@/features/oss/components/icon-relocation-up';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const relocateCstContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Déplacer des constituantes',
    body: (
      <>
        <p>
          <TourHelpLink text='Déplacer' topic={HelpTopic.UI_RELOCATE_CST} /> transfère des constituantes originales entre
          schémas liés par une opération OSS.
        </p>
        <p>
          Choisissez <b>Schéma source</b>, inversez le <b>Sens du déplacement</b>{' '}
          <IconRelocationUp value={true} className='inline-icon' /> /{' '}
          <IconRelocationUp value={false} className='inline-icon' /> (vers un argument ou vers un résultat), puis
          sélectionnez <b>Schéma cible</b>.
        </p>
      </>
    )
  },
  selection: {
    title: 'Ce qui peut bouger',
    body: (
      <p>
        La liste se remplit après le choix de <b>Schéma cible</b> — elle montre les candidates pour la paire{' '}
        <b>Schéma source</b> → <b>Schéma cible</b> ; les éléments inadmissibles n&apos;apparaissent pas. Seules les
        constituantes <b>originales</b> sont déplacées ; les héritées (bordure en pointillés) peuvent figurer dans la
        liste sans être déplacées. Sélectionnez-les puis cliquez sur <b>Déplacer</b>.
      </p>
    )
  }
};
