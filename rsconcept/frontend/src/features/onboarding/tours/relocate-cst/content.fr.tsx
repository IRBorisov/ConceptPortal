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
          <TourHelpLink text='Déplacer' topic={HelpTopic.UI_RELOCATE_CST} /> transfère des constituantes non héritées
          entre schémas liés par une opération OSS — en général vers un schéma argument ou vers un résultat.
        </p>
        <p>
          Choisissez le schéma source, inversez le sens avec <IconRelocationUp value={true} className='inline-icon' />,
          puis sélectionnez une destination autorisée.
        </p>
      </>
    )
  },
  selection: {
    title: 'Ce qui peut bouger',
    body: (
      <p>
        La liste ne montre que les constituantes non héritées et valides pour l&apos;arête choisie. Sélectionnez-les
        puis confirmez. Les éléments hérités ou bloqués restent en place pour garder une propagation cohérente.
      </p>
    )
  }
};
