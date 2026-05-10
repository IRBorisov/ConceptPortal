import { useTx } from '@/i18n';

export function HelpTerminologyControlFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lang.terminologyControl')}</h1>
      <p>
        Le portail permet de contrôler l&apos;emploi des termes rattachés aux entités dans les schémas conceptuels.
      </p>
      <p>
        On utilise pour cela des renvois textuels : <i>emploi du terme</i> et <i>liaison des mots.</i>
      </p>
      <p>
        Lors d&apos;un renvoi vers un terme, des paramètres de forme de mot sont indiqués afin d&apos;assurer une
        concordance correcte.
      </p>
      <p>
        <b>Grammème</b> — unité minimale d&apos;information grammaticale, par exemple le genre, le nombre, le cas.
      </p>
      <p>
        <b>Forme de mot</b> — forme grammaticale d&apos;une locution, susceptible de varier selon ses traits
        grammaticaux.
      </p>
      <p>
        <b>Lexème</b> — l&apos;ensemble des formes grammaticales et locutions associées à une locution donnée.
      </p>
      <p>
        Pour les locutions, on détermine le mot principal : il fixe l&apos;ensemble des grammèmes et sert de pivot
        d&apos;accord avec les autres mots de la phrase.
      </p>
    </>
  );
}
