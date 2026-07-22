import { HelpTopic } from '@/features/help';

import { IconGenerateStructure, IconStatusOK, IconStatusUnknown, IconTree, IconTypeGraph } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const conceptEditorContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Éditeur de constituante',
    body: (
      <p>
        Ici vous éditez une constituante dans l&apos;
        <TourHelpLink text='éditeur de constituante' topic={HelpTopic.UI_SCHEMA_EDITOR} />: terme, convention ou
        définition textuelle, et définition formelle. Sélectionnez une ligne dans la liste à gauche pour en ouvrir une
        autre.
      </p>
    )
  },
  fields: {
    title: 'Champs de la constituante',
    body: (
      <p>
        Éditez le terme et la définition formelle. Pour les concepts non définis, le sens est donné par une{' '}
        <TourHelpLink text='convention' topic={HelpTopic.CC_CONSTITUENTA} /> ; pour les dérivés — par une définition
        textuelle. Enregistrement — <kbd>Ctrl + S</kbd>.
      </p>
    )
  },
  check: {
    title: 'Vérification et diagnostics',
    body: (
      <>
        <p>
          Après modification de la définition formelle, l&apos;indicateur <IconStatusUnknown className='inline-icon' />{' '}
          <TourHelpLink text='statut d’expression' topic={HelpTopic.UI_CST_STATUS} /> devient bleu jusqu&apos;à la
          vérification. Cliquez dessus ou appuyez sur <kbd>Ctrl + Q</kbd>.
        </p>
        <p>
          En cas d&apos;erreurs, une liste apparaît sous l&apos;éditeur — un clic place le curseur sur le fragment. Un
          statut <IconStatusOK className='inline-icon' /> vert « valide » signifie que la définition est vérifiée et
          calculable.
        </p>
      </>
    )
  },
  tools: {
    title: 'Arbre syntaxique, graphe des échelons et structure',
    body: (
      <>
        <p>
          <IconTree className='inline-icon' />{' '}
          <TourHelpLink text='Arbre syntaxique' topic={HelpTopic.UI_FORMULA_TREE} /> — arbre d&apos;analyse de la
          définition formelle : structure et erreurs de parsing.
        </p>
        <p>
          <IconTypeGraph className='inline-icon' />{' '}
          <TourHelpLink text='Graphe des échelons' topic={HelpTopic.UI_TYPE_GRAPH} /> — comment les types de
          l&apos;expression s&apos;enchaînent en typification.
        </p>
        <p>
          Si la constituante a une structure de typification,{' '}
          <IconGenerateStructure size='1.25rem' className='inline-icon' /> Développer la structure ouvre le{' '}
          <TourHelpLink text='développement de structure' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> : depuis le graphe
          des échelons, ajoutez des constituantes générées et leurs termes.
        </p>
      </>
    )
  }
};
