import { useTx } from '@/i18n';

export function HelpConceptRelativizationFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.relativization')}</h1>
      <p>
        La relativisation change le point de vue sur une entité individuelle, appelée <b>cible de relativisation</b>.
        Cette entité est considérée comme une collection d’entités de même nature. Les concepts et les énoncés qui en
        dépendent deviennent relatifs à chaque contexte.
      </p>
      <p>
        Le <b>nom de la famille</b>, choisi par l’utilisateur, est ajouté aux termes du schéma conceptuel source. Dans
        le schéma obtenu, on applique l’opérateur d’ensemble des parties au domaine de définition de la cible pour
        obtenir l’<b>ensemble des contextes</b> de relativisation. Les autres constituants non définis du schéma source
        peuvent être associés à cet ensemble ou être exclus de la relativisation.
      </p>
      <p>
        Les formules des énoncés et des concepts dérivés qui dépendent de la cible et des constituants non définis
        relativisés sont réécrites pour utiliser les valeurs des concepts dans le contexte courant. Les termes
        dépendants deviennent des familles de couples « contexte, valeur ». Les fonctions et les prédicats reçoivent le
        contexte en premier argument. Les axiomes et les énoncés sont vérifiés dans tous les contextes admissibles.
      </p>
      <p>
        Une <b>fonction de dérélativisation</b> est introduite pour traiter les références aux constituants modifiés
        dans les définitions formelles. Elle extrait d’un constituant relativisé l’unique valeur pour un contexte donné.
      </p>
    </>
  );
}
