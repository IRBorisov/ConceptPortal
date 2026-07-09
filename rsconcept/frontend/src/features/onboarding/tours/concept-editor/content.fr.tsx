import { HelpTopic } from '@/features/help';

import { IconGenerateStructure, IconStatusOK, IconStatusUnknown, IconTree, IconTypeGraph } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const conceptEditorContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Éditeur de constituante',
    body: (
      <p>
        Ici, une constituante est modifiée dans l&apos;
        <TourHelpLink text='éditeur de constituante' topic={HelpTopic.UI_SCHEMA_EDITOR} /> : son terme, sa définition
        textuelle et sa définition formelle. Sélectionnez des constituantes dans la liste pour les ouvrir dans cet
        onglet.
      </p>
    )
  },
  check: {
    title: 'Vérification et diagnostic',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Après avoir modifié une définition formelle, l&apos;indicateur <IconStatusUnknown className='inline-icon' />{' '}
          de <TourHelpLink text='statut de définition' topic={HelpTopic.UI_CST_STATUS} /> devient bleu jusqu&apos;à ce
          que vous lanciez une vérification. Cliquez dessus ou appuyez sur <kbd>Ctrl + Q</kbd> pour valider
          l&apos;expression.
        </p>
        <p>
          En cas d&apos;erreur, une liste apparaît sous l&apos;éditeur — cliquez sur un message pour aller au fragment
          problématique. Un statut <IconStatusOK className='inline-icon' /> vert signifie que la définition est
          vérifiée.
        </p>
      </div>
    )
  },
  tools: {
    title: 'Arbre de syntaxe et graphe des échelons',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Le bouton <IconTree className='inline-icon' />{' '}
          <TourHelpLink text='arbre de syntaxe' topic={HelpTopic.UI_FORMULA_TREE} /> ouvre une boîte de dialogue avec
          l&apos;arbre d&apos;analyse de la définition formelle — utile pour comprendre la structure et repérer les
          erreurs d&apos;analyse.
        </p>
        <p>
          Le bouton <IconTypeGraph className='inline-icon' />{' '}
          <TourHelpLink text='graphe des échelons' topic={HelpTopic.UI_TYPE_GRAPH} /> montre comment les types de
          l&apos;expression se relient sous forme de graphe de typification.
        </p>
      </div>
    )
  },
  structure: {
    title: 'Planificateur de structure',
    body: (
      <p>
        Pour les concepts structurés, <IconGenerateStructure size='1.25rem' className='inline-icon' /> Développer la
        structure ouvre le <TourHelpLink text='planificateur de structure' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> :
        un graphe interactif pour décomposer un concept en constituantes dérivées. Vous pouvez ajouter, modifier et
        relier des éléments directement depuis le diagramme.
      </p>
    )
  }
};
