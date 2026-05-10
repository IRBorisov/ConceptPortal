import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpContributorsFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.general.developer.acknowledgements')}</h1>
      <p>
        L&apos;histoire des outils pour schémas conceptuels remonte aux années 1970 et se poursuit aujourd&apos;hui.
        Cette page tente humblement de recenser les contributions aux outils et au formalisme mathématique de
        l&apos;explicitation des schémas conceptuels.
      </p>
      <p>
        Chaque année correspond à l&apos;achèvement du travail ou à l&apos;année de publication. L&apos;italique souligne
        l&apos;importance du résultat.
      </p>
      <p>Les ajouts et corrections sont les bienvenus.</p>
      <ul className='flex flex-col gap-3'>
        <li>1973 — Nikanorov S.P., Persits D.B. Conception formelle de systèmes intégrés d&apos;organisation et de gestion.</li>
        <li>
          1975–1981 — Nikanorov S.P., Persits D.B., Ayzenstadt A.V., Zaks B.A. Système expérimental de paquets pour la
          conception automatisée de systèmes d&apos;organisation et de gestion (ASP SOU).
        </li>
        <li>1976 — Pospelov D.A., Chernyshev S.B. Construction d&apos;un modèle formel-logique de très grande taille.</li>
        <li>
          1977 — Persits D.B., Savelov E.V., Tishchenko A.V. Fondements théoriques de l&apos;ASP SOU,{' '}
          <i>base pour formaliser des domaines par explicitation de schémas conceptuels.</i>
        </li>
        <li>
          1980 — Nikanorov S.P., Persits D.B., Egorov B.B., Nikitina N.K., Ashikhmin V.S., Astrina I.V., Tishchenko A.V.
          Sous-système de documentation dans l&apos;ASP SOU.
        </li>
        <li>
          1986 — Nikanorov S.P., Kuchkarov Z.A., Nikitina N.K., Kryukov I.A., Komarov V.G. Système automatisé de conception
          au niveau conceptuel des bases de données (MAKS),{' '}
          <i>
            posant les bases du stockage de schémas conceptuels en bases de données et premier éditeur d&apos;explicitation
            en structures de genres dans le groupe de Nikitina.
          </i>
        </li>
        <li>
          1987 — Ivanov A.Yu., Kuchkarov Z.A. Dispositifs conceptuels et mathématiques pour décrire les processus de
          décision.
        </li>
        <li>
          1989 — Ostapov A.V., Kuchkarov Z.A. Questions méthodologiques de conceptualisation des domaines,{' '}
          <i>
            exemple des travaux d&apos;Ostapov ayant largement étendu la technique d&apos;explicitation et l&apos;usage
            d&apos;expressions « sans quantificateurs ».
          </i>
        </li>
        <li>
          1990 — Postnikov V.V., Nikitina N.K. Analyseur syntaxique du texte de genre de structure pour MAKS,{' '}
          <i>première tentative de vérification automatisée du syntaxe des genres de structures.</i>
        </li>
        <li>
          1993 — Yudkin Yu.Yu., Kostyuk A.V., Nikitina N.K. Programme de visualisation des M-graphes des genres de
          structures.
        </li>
        <li>1993 — Nikitina N.K., Chuvashov E.V. Système de conception de bases de données à partir d&apos;un modèle conceptuel.</li>
        <li>
          1993 — Nikanorov S.P., Kuchkarov Z.A., Ostapov A.V., Shulpekin A.N., Koval A.G., Kostyuk A.V. Programme
          d&apos;opérationnalisation des textes de modèles conceptuels en syntaxe des genres de structures Exteor 1,{' '}
          <i>premier éditeur d&apos;explicitation en structures de genres dans le groupe de Kuchkarov.</i>
        </li>
        <li>
          1993 — Kuchkarov Z.A., Lavrov V., Krynev A., Shulpekin A.N., Simonov M. Générateur automatique de programmes PROLOG
          produisant des interprétations de domaine pour les explicitations Intteor.
        </li>
        <li>
          1994 — Kim V.L., Kuchkarov Z.A. Conceptions en structures de genres pour la bibliothèque de modèles et étude de
          leur extension.
        </li>
        <li>
          1994 — Vorobei P.N., Koval A.G. Éditeur de la suite logicielle Exteor 1.5,{' '}
          <i>simplifiant l&apos;impression des explicitations et améliorant l&apos;analyse syntaxique des expressions
          formelles.</i>
        </li>
        <li>
          1996 — Koval A.G., Kuchkarov Z.A., Kostyuk A.V., Kononenko A.A., Sin Yu.E., Maklakov Yu.I. Programme de synthèse
          en structures de genres des modèles conceptuels terminaux opérationnalisés Exteor 2,{' '}
          <i>première implémentation C++/Windows de l&apos;appareil des structures de genres.</i>
        </li>

        <li>
          1996 — Klimishin V.V., Nikanorov S.P., Nikitina N.K. Système automatisé « Bibliothèque de schémas conceptuels »,{' '}
          <i>première définition du passeport de schéma conceptuel.</i>
        </li>
        <li>
          1997 — Yuryev O.I., Nikitina N.K. Système d&apos;accompagnement des processus d&apos;analyse et de conception
          conceptuelle Proxima 1.
        </li>
        <li>
          1998 — Garaeva Yu.R., Nikitina N.K. Analyseur syntaxique des expressions en langage d&apos;explicitation
          RS-structure pour Proxima 1.
        </li>
        <li>
          1998 — Sin Yu.E. Recherche sur une classe d&apos;opérations théorico-modèle pour la filière technologique de
          conception conceptuelle.
        </li>
        <li>
          1999 — Kononenko A.A., Kuchkarov Z.A. Programme de transformation de la synthèse RS-structure des modèles
          conceptuels terminaux opérationnalisés Exteor 3,{' '}
          <i>introduisant pour la première fois le schéma opérationnel de synthèse (arbre de synthèse).</i>
        </li>
        <li>
          1999 — Landin N.A., Nikitina N.K. Sous-système automatisé pour opérations de décollement et de section sur
          schémas conceptuels.
        </li>
        <li>
          1999 — Yuryev O.I., Zverev V.Yu. Version expérimentale du système « Bibliothèque de projets de systèmes
          d&apos;organisation et de gestion ».
        </li>
        <li>
          2000 — Kuchkarov Z.A., Kononenko A.A., Sin Yu.E. Générateur de réseau Orgteor de procédures organisationnelles
          interprété et défini conceptuellement,{' '}
          <i>
            permettant des schémas de processus à partir du graphe de termes du schéma conceptuel et, pour la première
            fois, un module de transformations terminologiques des descriptions textuelles.
          </i>
        </li>
        <li>
          2000 — Mayorov V.A., Kononenko A.A. Générateur automatisé de structure de données et visualisation pour le modèle
          conceptuel BDteor,{' '}
          <i>
            mettant en évidence les problèmes d&apos;interface pour remplir un modèle conceptuel à étages complexes et une
            bibliothèque Kernel pour fixer l&apos;interprétation via M-graphes.
          </i>
        </li>
        <li>2000 — Tishchenko A.V. Échelles d&apos;ensembles et genres de structures.</li>
        <li>
          2000 — Tishchenko A.V., Akimenkov A.M., Klyuchnikov A.V. Système d&apos;opérations sur schémas conceptuels en
          forme RS-structure.
        </li>
        <li>2000 — Klyuchnikov A.V. Équivalence des théories de genres de structures.</li>
        <li>
          2001 — Nikitin A.V., Kuchkarov Z.A. Typologie des changements d&apos;interprétations ensemblistes pour la classe
          produit cartésien.
        </li>
        <li>
          2001 — Mayorov V.A., Kononenko A.A. Convertisseur de réseaux de procédures Orgteor vers BPWin (IDEF0).
        </li>
        <li>
          2001 — Mayorov V.A. Construction d&apos;expressions formelles par choix d&apos;alternatives Grammar,{' '}
          <i>voie alternative pour des expressions formelles correctes.</i>
        </li>
        <li>
          2004 — Garaeva Yu.R., Ponomarev I.N. Bourbakizateur, analyseur sémantico-syntaxique des textes de genres de
          structures,{' '}
          <i>
            premier analyse grammatical complet des genres de structures et vérification de la portabilité bijective des
            expressions.
          </i>
        </li>
        <li>
          2003 — Yudkin Yu.Yu., Kudyukin D.A. Programme informatique produisant l&apos;interprétation ensembliste d&apos;un
          terme d&apos;une théorie RS-structure partielle.
        </li>

        <li>
          2004 — Kononenko A.A. Génération de code C++ à partir du texte d&apos;un schéma conceptuel en genres de
          structures.
        </li>
        <li>
          2004 — Kononenko A.A., Kuchkarov Z.A., Nikanorov S.P., Nikitina N.K. Technologie de conception conceptuelle —{' '}
          <i>monographie : panorama historique et perspectives de la filière.</i>
        </li>
        <li>2006 — Kuchkarov Z.A., Nikanorov S.P. Bibliothèque de modèles.</li>
        <li>2006 — Kuchkarov Z.A., Lavrov V.A. Systèmes complets d&apos;opérations ensemblistes simples.</li>
        <li>
          2006 — Solntsev S.V., Prisakar S.V. Introduction de relations quantitatives dans la méthodologie d&apos;analyse et
          de conception conceptuelles, y compris dans le langage d&apos;explicitation RS-structure.
        </li>
        <li>
          2007 — Ponomarev I.N. Polycopié : Introduction à la logique mathématique et aux genres de structures,{' '}
          <i>exposé le plus complet de la théorie des genres de structures utilisée dans les explicitations RS-structure.</i>
        </li>
        <li>
          2008 — Ponomarev I.N. Sur la représentabilité équivalente d&apos;un genre de structure par une signature de types
          donnée.
        </li>
        <li>
          2010 — Gryaznov A.D., Kononenko A.A. Recherche et construction d&apos;un traducteur schéma conceptuel vers
          modèle conceptuel.
        </li>
        <li>2010 — Nikanorov S.P. Introduction au calcul des étages.</li>
        <li>
          2012 — Elisov D.N., Kononenko A.A. Usage de schémas XSD pour stocker et opérationnaliser schémas et modèles
          conceptuels en XML.
        </li>
        <li>
          2013 — Borisov I.R., Kononenko A.A. Recherche, développement et mise en œuvre expérimentale d&apos;opérations sur
          modèles conceptuels,{' '}
          <i>
            première intégration d&apos;un module d&apos;évaluation directe d&apos;interprétations d&apos;expressions
            formelles dans Exteor 3.5.
          </i>
        </li>
        <li>
          2013 — Lipatov A.A., Ponomarev I.N. Opérations sur les genres de structures et exemple d&apos;automatisation.
        </li>
        <li>
          2014 — Bashirov R.M., Borisov I.R. Recherche et implémentation de structures de données optimales pour évaluer les
          interprétations de schémas conceptuels.
        </li>
        <li>
          2014 — Borisov I.R. Suite logicielle Exteor 4,{' '}
          <i>
            avec module de synthèse opérationnelle étendu et analyseur syntaxique fondé sur la grammaire de Ponomarev I.N.
          </i>
        </li>
        <li>
          2014 — Borisov I.R. Constructions conceptuelles dans la synthèse de systèmes sur l&apos;exemple du code
          environnemental —{' '}
          <i>
            introduction des constructions conceptuelles comme formes intermédiaires pour opérationnaliser les schémas
            conceptuels.
          </i>
        </li>
        <li>2015 — Ivanov A.Yu. Calcul des étages de Nikanorov S.P. et prolongements possibles.</li>
        <li>
          2016 — Bashirov R.M., Borisov I.R. Lingvistique informatique et modules de contrôle terminologique dans Exteor 4
          et Microsoft Word,{' '}
          <i>
            base de la bibliothèque <TextURL text='cctext' href={external_urls.git_cctext} />.
          </i>
        </li>
        <li>
          2016 — Borisov I.R. Exteor 4.5,{' '}
          <i>
            ajout d&apos;un module textuel et d&apos;un noyau refondu factorisé en bibliothèque (
            <TextURL text='ConceptCore' href={external_urls.git_core} />).
          </i>
        </li>
        <li>
          2017 — Ivanov A.Yu. Introduction à la conceptualisation des domaines sociologiques : fondements du noyau
          théorique (exemple du lien de parenté).
        </li>
        <li>
          2017 — Muradov A.K., Borisov I.R. Organisation des opérations sur systèmes de concepts par interfaces
          graphiques,{' '}
          <i>socle pour Concept.Blocks et le bloc de synthèse graphique.</i>
        </li>
        <li>
          2018 — Knyazev A.V., Borisov I.R. Méthodes de clarification conceptuelle et de balisage textuel avec outils
          d&apos;automatisation —{' '}
          <i>mémoire de fin d&apos;études sous-tendant Concept.Markup et Concept.Mining.</i>
        </li>
        <li>
          2018 — Bolotin P.V., Nikitin A.V. Typologie des changements d&apos;interprétations ensemblistes pour la classe
          ensemble des parties.
        </li>
        <li>
          2019 — Shirokova L.R., Borisov I.R. Apprentissage automatique pour la clarification de textes : prototype —{' '}
          <i>première intégration d&apos;IA dans le module textuel.</i>
        </li>
        <li>
          2020 — Pakulina T.A., Borisov I.R. Reconnaissance d&apos;entités nommées dans des entretiens : recherche ML et
          module de clarification,{' '}
          <i>extension de Concept.Clearing.</i>
        </li>
        <li>
          2020 — Exteor 4.7 avec extensions majeures au langage des genres de structures (expressions récursives et
          impératives, filtres, syntaxe ASCII).
        </li>
        <li>
          2021 — Demeshko A.B., Borisov I.R. Module générant des textes de fonctions à partir du concept « structure
          fonctionnelle »,{' '}
          <i>ajoutant la prise en charge des formes verbales au module textuel.</i>
        </li>
        <li>
          2023 — Tulisov A.V., Borisov I.R. Outil web d&apos;explicitation RS-structure —{' '}
          <i>prototype d&apos;interface ConceptPortal.</i>
        </li>
        <li>
          2024 — Borisov I.R. <LinkTopic text='Exteor 4.9' topic={HelpTopic.EXTEOR} /> pour schémas exportés depuis
          ConceptPortal.{' '}
          <i>
            ConceptCore (C++) exposé à Python via l&apos;enveloppe <TextURL text='pyconcept' href={external_urls.git_core} />.
          </i>
        </li>
        <li>
          2024 — Khadanovich B.A., Borisov I.R. Changements bout en bout dans les schémas de synthèse opérationnelle ;
          prototype web pour la synthèse conceptuelle.
          <i> Prototype d&apos;interface graphique pour la synthèse conceptuelle.</i>
        </li>
        <li>
          2024 — Vikentiev M.I., Borisov I.R. Interfaces web modernes pour visualiser les relations dans la synthèse
          conceptuelle.{' '}
          <i>Visualisations mixtes de schémas conceptuels.</i>
        </li>
      </ul>
    </>
  );
}
