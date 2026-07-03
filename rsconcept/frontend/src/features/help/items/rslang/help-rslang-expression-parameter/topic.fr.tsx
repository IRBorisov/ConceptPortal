import { useTx } from '@/i18n';

export function HelpRSLangExpressionParameterFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.parameter')}</h1>
      <p>
        Les expressions paramétrées du langage des genres de structures forment une classe indépendante de
        constructions. Elles sont utilisées pour déclarer des fonctions-terme et des fonctions-prédicat. L'appel de
        telles fonctions produit respectivement une expression ensembliste (EE) ou une expression logique (EL).
      </p>

      <h2>Déclaration d'une fonction-terme</h2>
      <code>F1 ::= [α1∈EE1, α2∈EE2(α1)] EE(α1, α2)</code>
      <ul>
        <li>Entre crochets, une liste ordonnée de déclarations de paramètres est fournie, séparée par des virgules.</li>
        <li>
          Un paramètre est déclaré à l'aide du prédicat d'appartenance <code>∈</code>. À gauche se trouve l'identifiant
          de la variable locale ; à droite, le domaine du paramètre.
        </li>
        <li>
          Les variables déclarées peuvent être utilisées dans les domaines des paramètres suivants et dans l'EE
          définissant le résultat de la fonction.
        </li>
      </ul>

      <h2>Déclaration d'une fonction-prédicat</h2>
      <code>P1 ::= [α1∈EE1, α2∈EE2(α1)] EL(α1, α2)</code>
      <p>
        La différence avec une fonction-terme est qu'une expression logique suit la liste de paramètres au lieu d'une
        EE.
      </p>

      <h2>Appel de fonctions</h2>
      <code>F1[ξ1, S1], P1[ξ1\ξ2, ξ3]</code>
      <ul>
        <li>Les arguments sont listés entre crochets après le nom de la fonction ; l'ordre a de l'importance.</li>
        <li>Les typifications des arguments sont vérifiées par rapport aux typifications des paramètres déclarés.</li>
        <li>
          Le résultat de l'appel d'une fonction-terme est une EE ; l'appel d'une fonction-prédicat produit une EL.
        </li>
      </ul>

      <h2>Expressions modèles</h2>
      <code>F2 ::= [α1∈R1×R2, α2∈R1] α2=pr1(α1)</code>
      <p>
        Les fonctions dont les paramètres contiennent des <b>radicaux</b> sont appelées modèles. Un radical désigne une
        typification arbitraire dans le grade de l'argument de la fonction.
      </p>
      <ul>
        <li>
          Lors de l'appel de la fonction, la valeur du radical est inférée à partir des typifications des arguments.
          Toutes les valeurs calculées doivent correspondre.
        </li>
        <li>Les radicaux avec des indices différents sont considérés comme distincts en typification.</li>
        <li>
          Les radicaux ne peuvent être utilisés que dans les descriptions des domaines des paramètres, pas dans
          l'expression du résultat.
        </li>
      </ul>

      <h2>Vérification de la typification</h2>
      <p>
        Lors de l'appel d'une fonction modèle, l'analyseur compare la typification de chaque argument à la déclaration
        du paramètre correspondant. Un radical dans le domaine d'un paramètre est un emplacement pour un grade
        arbitraire : sa valeur est inférée à partir de la typification réelle de l'argument. Si un même radical apparaît
        dans plusieurs paramètres, les grades inférés doivent coïncider.
      </p>
      <p>
        En cas d'incompatibilité, le message indique les typifications attendue et effective, par exemple : attendu
        ζ∈ℬℬ(X1), obtenu Z. Pour les arguments après le premier, les radicaux dans la typification attendue sont
        remplacés par les valeurs déjà inférées à partir des arguments précédents — <code>R1</code> est affiché comme
        grade concret, comme dans l'exemple.
      </p>
      <p>
        Si l'erreur concerne le premier argument et qu'aucune valeur de radical n'est encore disponible, le diagnostic
        peut qualifier le radical avec le nom de la fonction, par ex. <code>{'R1<P2>'}</code>.
      </p>
    </>
  );
}
