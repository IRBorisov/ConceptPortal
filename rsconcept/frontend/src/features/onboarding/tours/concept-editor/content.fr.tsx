import { HelpTopic } from '@/features/help';

import { IconGenerateStructure, IconStatusOK, IconStatusUnknown, IconTree, IconTypeGraph } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';
const checkHotkey = isMac() ? 'Cmd + Q' : 'Ctrl + Q';

export const conceptEditorContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Concept',
    body: (
      <p>
        L&apos;onglet « Concept » sert à éditer une constituante dans l&apos;
        <TourHelpLink text='éditeur de constituante' topic={HelpTopic.UI_SCHEMA_EDITOR} />. Sélectionnez une ligne dans
        la liste à gauche pour en ouvrir une autre.
      </p>
    )
  },
  fields: {
    title: 'Champs de la constituante',
    body: (
      <p>
        Éditez le terme, la typification et l&apos;expression formelle (le libellé du champ dépend du type : définition
        formelle, domaine de définition, définition de fonction…). Pour les concepts non définis, le sens est donné par
        une <TourHelpLink text='convention' topic={HelpTopic.CC_CONSTITUENTA} /> ; pour les dérivés — par une définition
        textuelle. Enregistrement — <kbd>{saveHotkey}</kbd>.
      </p>
    )
  },
  check: {
    title: 'Vérification et diagnostics',
    body: (
      <>
        <p>
          La pastille <IconStatusUnknown className='inline-icon' /> « non vérifié » (bleue) — cliquez dessus ou appuyez
          sur <kbd>{checkHotkey}</kbd> pour{' '}
          <TourHelpLink text='vérifier l’expression' topic={HelpTopic.UI_CST_STATUS} />.
        </p>
        <p>
          En cas d&apos;erreurs, une liste apparaît sous l&apos;éditeur — un clic place le curseur sur le fragment. Un
          statut <IconStatusOK className='inline-icon' /> vert « valide » signifie que la définition est vérifiée et
          calculable ; vert « non mesurable » — vérifiée mais seulement comme contrôle d&apos;appartenance.
        </p>
      </>
    )
  },
  tools: {
    title: 'Arbre syntaxique et structure de typification',
    body: (
      <>
        <p>
          Icônes à droite du champ d&apos;expression : aide, clavier de symboles, structure de typification et arbre
          syntaxique.
        </p>
        <p>
          <IconTree className='inline-icon' />{' '}
          <TourHelpLink text='Arbre syntaxique' topic={HelpTopic.UI_FORMULA_TREE} /> — arbre d&apos;analyse de
          l&apos;expression formelle : structure et erreurs de parsing.
        </p>
        <p>
          <IconTypeGraph className='inline-icon' />{' '}
          <TourHelpLink text='Graphe des échelons à partir de l’expression' topic={HelpTopic.UI_TYPE_GRAPH} /> — comment
          les types de l&apos;expression s&apos;enchaînent en typification (icône masquée pour les constituantes
          logiques).
        </p>
      </>
    )
  },
  structure: {
    title: 'Développer la structure',
    body: (
      <p>
        Si le bouton <IconGenerateStructure size='1.25rem' className='inline-icon' /> Développer la structure est
        disponible, il ouvre le{' '}
        <TourHelpLink text='développement de structure' topic={HelpTopic.UI_STRUCTURE_PLANNER} /> : depuis la structure
        de typification, ajoutez des constituantes générées et leurs termes.
      </p>
    )
  }
};
