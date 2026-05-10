import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpContributorsEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.general.developer.acknowledgements')}</h1>
      <p>
        The history of tools for conceptual schemes reaches back to the 1970s and continues today. This page is a modest
        attempt to record who contributed to the software and mathematical apparatus behind conceptual-scheme explication.
      </p>
      <p>
        Each year is the completion date of the work or the publication year of the cited article. Italics highlight why
        an entry matters.
      </p>
      <p>Additions and corrections are welcome.</p>
      <ul className='flex flex-col gap-3'>
        <li>1973 — Nikanorov S.P., Persits D.B. Formal design of integrated organization-management systems.</li>
        <li>
          1975–1981 — Nikanorov S.P., Persits D.B., Ayzenstadt A.V., Zaks B.A. Experimental package system for automated
          design of organizational management systems (ASP SOU).
        </li>
        <li>1976 — Pospelov D.A., Chernyshev S.B. Building a formal-logical model of very large scale.</li>
        <li>
          1977 — Persits D.B., Savelov E.V., Tishchenko A.V. Theoretical foundations of ASP SOU,{' '}
          <i>a base for domain formalization through conceptual-scheme explication.</i>
        </li>
        <li>
          1980 — Nikanorov S.P., Persits D.B., Egorov B.B., Nikitina N.K., Ashikhmin V.S., Astrina I.V., Tishchenko A.V.
          Documentation subsystem in ASP SOU.
        </li>
        <li>
          1986 — Nikanorov S.P., Kuchkarov Z.A., Nikitina N.K., Kryukov I.A., Komarov V.G. Automated design system for
          conceptual-level databases (MAKS),{' '}
          <i>
            laying the groundwork for storing conceptual schemes in databases and the first RS-structure explication
            editor in Nikitina&apos;s group.
          </i>
        </li>
        <li>
          1987 — Ivanov A.Yu., Kuchkarov Z.A. Conceptual and mathematical tools for describing decision processes.
        </li>
        <li>
          1989 — Ostapov A.V., Kuchkarov Z.A. Methodical issues of domain conceptualization,{' '}
          <i>
            exemplifying Ostapov&apos;s work extending explication technique and use of &quot;quantifier-free&quot;
            expressions.
          </i>
        </li>
        <li>
          1990 — Postnikov V.V., Nikitina N.K. Syntax analyzer for genus-of-structure text in MAKS,{' '}
          <i>first attempt at automated syntax checking for genera of structures.</i>
        </li>
        <li>
          1993 — Yudkin Yu.Yu., Kostyuk A.V., Nikitina N.K. Visualization program for M-graphs of genera of structures.
        </li>
        <li>1993 — Nikitina N.K., Chuvashov E.V. Database design system from a conceptual model.</li>
        <li>
          1993 — Nikanorov S.P., Kuchkarov Z.A., Ostapov A.V., Shulpekin A.N., Koval A.G., Kostyuk A.V. Program for
          operationalizing conceptual-model texts in genera-of-structures syntax Exteor 1,{' '}
          <i>first RS-structure explication editor in Kuchkarov&apos;s group.</i>
        </li>
        <li>
          1993 — Kuchkarov Z.A., Lavrov V., Krynev A., Shulpekin A.N., Simonov M. Automatic generator of PROLOG programs
          building domain interpretations of RS-structure explications Intteor.
        </li>
        <li>
          1994 — Kim V.L., Kuchkarov Z.A. RS-structure constructs for the model library and research on extending them.
        </li>
        <li>
          1994 — Vorobei P.N., Koval A.G. Editor for software suite Exteor 1.5,{' '}
          <i>simplifying printing explications and improving syntax analysis of formal expressions.</i>
        </li>
        <li>
          1996 — Koval A.G., Kuchkarov Z.A., Kostyuk A.V., Kononenko A.A., Sin Yu.E., Maklakov Yu.I. Program for
          RS-structure synthesis of operationalized terminal conceptual models Exteor 2,{' '}
          <i>first C++/Windows implementation of the RS-structure apparatus.</i>
        </li>

        <li>
          1996 — Klimishin V.V., Nikanorov S.P., Nikitina N.K. Automated system &quot;Library of conceptual schemes&quot;,{' '}
          <i>first to define the conceptual-scheme passport.</i>
        </li>
        <li>
          1997 — Yuryev O.I., Nikitina N.K. Support system for conceptual analysis and design processes Proxima 1.
        </li>
        <li>
          1998 — Garaeva Yu.R., Nikitina N.K. Syntax analyzer for RS-structure explication language in Proxima 1.
        </li>
        <li>
          1998 — Sin Yu.E. Research on a class of theory-model operations for the conceptual-design technology line.
        </li>
        <li>
          1999 — Kononenko A.A., Kuchkarov Z.A. Program transforming RS-structure synthesis of operationalized terminal
          conceptual models Exteor 3,{' '}
          <i>first to include an operational synthesis scheme (synthesis tree).</i>
        </li>
        <li>
          1999 — Landin N.A., Nikitina N.K. Automated subsystem for peel and cut operations on conceptual schemes.
        </li>
        <li>
          1999 — Yuryev O.I., Zverev V.Yu. Experimental &quot;Library of organizational management system projects&quot;.
        </li>
        <li>
          2000 — Kuchkarov Z.A., Kononenko A.A., Sin Yu.E. Generator for a conceptually defined Orgteor network of
          interpreted organizational procedures,{' '}
          <i>
            enabling process diagrams from the conceptual scheme term graph and, for the first time, a terminology
            transform module for text descriptions.
          </i>
        </li>
        <li>
          2000 — Mayorov V.A., Kononenko A.A. Automated structure and visualization generator for the BDteor conceptual
          model,{' '}
          <i>
            identifying UI issues when filling complex-stage conceptual models and proposing a Kernel library to hold
            interpretations via M-graphs.
          </i>
        </li>
        <li>2000 — Tishchenko A.V. Set scales and genera of structures.</li>
        <li>
          2000 — Tishchenko A.V., Akimenkov A.M., Klyuchnikov A.V. Operation system for conceptual schemes in
          RS-structure form.
        </li>
        <li>2000 — Klyuchnikov A.V. Equivalence of genera-of-structures theories.</li>
        <li>
          2001 — Nikitin A.V., Kuchkarov Z.A. Typology of changes to set-theoretic interpretations of Cartesian-product
          classes.
        </li>
        <li>
          2001 — Mayorov V.A., Kononenko A.A. Converter from Orgteor procedure networks to BPWin (IDEF0).
        </li>
        <li>
          2001 — Mayorov V.A. Grammar-alternative builder for formal expressions,{' '}
          <i>an alternate route to correct formal expressions.</i>
        </li>
        <li>
          2004 — Garaeva Yu.R., Ponomarev I.N. Bourbakizator semantic-syntax analyzer for genera-of-structure texts,{' '}
          <i>
            first full grammar analysis for genera of structures and bijective portability checking of expressions.
          </i>
        </li>
        <li>
          2003 — Yudkin Yu.Yu., Kudyukin D.A. Computer program building set-theoretic interpretations for terms of a
          partial RS-structure theory.
        </li>

        <li>
          2004 — Kononenko A.A. Generating C++ code from a conceptual scheme text in genera of structures.
        </li>
        <li>
          2004 — Kononenko A.A., Kuchkarov Z.A., Nikanorov S.P., Nikitina N.K. Conceptual design technology —{' '}
          <i>monograph with historical survey and outlook for the technology line.</i>
        </li>
        <li>2006 — Kuchkarov Z.A., Nikanorov S.P. Model library.</li>
        <li>2006 — Kuchkarov Z.A., Lavrov V.A. Complete systems of simple set-theoretic operations.</li>
        <li>
          2006 — Solntsev S.V., Prisakar S.V. Embedding quantitative relations in conceptual analysis and design
          methodology, including RS-structure explication language.
        </li>
        <li>
          2007 — Ponomarev I.N. Course notes: Introduction to mathematical logic and genera of structures,{' '}
          <i>the fullest presentation of the genera-of-structures theory used in RS-structure explications.</i>
        </li>
        <li>
          2008 — Ponomarev I.N. On equivalent representability of a genus of structure by a given type signature.
        </li>
        <li>
          2010 — Gryaznov A.D., Kononenko A.A. Research and construction of a conceptual-scheme-to-model translator.
        </li>
        <li>2010 — Nikanorov S.P. Introduction to the stage calculus.</li>
        <li>
          2012 — Elisov D.N., Kononenko A.A. Using XSD schemas to store and operationalize conceptual schemes and models in
          XML.
        </li>
        <li>
          2013 — Borisov I.R., Kononenko A.A. Research, development, and experimental implementation of operations on
          conceptual models,{' '}
          <i>
            first to embed a module for direct evaluation of formal-expression interpretations inside Exteor 3.5.
          </i>
        </li>
        <li>
          2013 — Lipatov A.A., Ponomarev I.N. Operations on genera of structures and an automation example.
        </li>
        <li>
          2014 — Bashirov R.M., Borisov I.R. Research and implementation of optimal data structures to evaluate conceptual
          scheme interpretations.
        </li>
        <li>
          2014 — Borisov I.R. Exteor 4 software suite,{' '}
          <i>
            with an extended operational-synthesis module and syntax analyzer based on Ponomarev I.N.&apos;s grammar.
          </i>
        </li>
        <li>
          2014 — Borisov I.R. Conceptual constructions in system synthesis using the environmental code —{' '}
          <i>
            introducing conceptual constructions as intermediate forms for operationalizing conceptual schemes.
          </i>
        </li>
        <li>2015 — Ivanov A.Yu. Nikanorov S.P. stage calculus and possible further directions.</li>
        <li>
          2016 — Bashirov R.M., Borisov I.R. Computational linguistics research and terminology-control modules in
          Exteor 4 and Microsoft Word,{' '}
          <i>
            forming the basis of the <TextURL text='cctext' href={external_urls.git_cctext} /> library.
          </i>
        </li>
        <li>
          2016 — Borisov I.R. Exteor 4.5,{' '}
          <i>
            adding a text module and a rebuilt core factored into a library (
            <TextURL text='ConceptCore' href={external_urls.git_core} />).
          </i>
        </li>
        <li>
          2017 — Ivanov A.Yu. Conceptualizing sociology domains: grounds for theory cores (kinship example).
        </li>
        <li>
          2017 — Muradov A.K., Borisov I.R. Organizing operations on systems of concepts via graphical interfaces,{' '}
          <i>foundation for Concept.Blocks and the graphical synthesis block.</i>
        </li>
        <li>
          2018 — Knyazev A.V., Borisov I.R. Conceptual clearing and text markup methods with automation tools —{' '}
          <i>thesis underpinning Concept.Markup and Concept.Mining.</i>
        </li>
        <li>
          2018 — Bolotin P.V., Nikitin A.V. Typology of changes to set-theoretic interpretations of power-set classes.
        </li>
        <li>
          2019 — Shirokova L.R., Borisov I.R. Machine learning for text clearing: prototype module —{' '}
          <i>first AI integration in the text module.</i>
        </li>
        <li>
          2020 — Pakulina T.A., Borisov I.R. Named-entity recognition in interview texts: ML research and a clearing
          module,{' '}
          <i>extending Concept.Clearing.</i>
        </li>
        <li>
          2020 — Exteor 4.7 with major extensions to the genera-of-structures language (recursive and imperative
          constructs, filters, ASCII syntax).
        </li>
        <li>
          2021 — Demeshko A.B., Borisov I.R. Module generating function texts from the &quot;functional structure&quot;
          concept,{' '}
          <i>adding verbal-form support to the text module.</i>
        </li>
        <li>
          2023 — Tulisov A.V., Borisov I.R. Web-based RS-structure explication tool —{' '}
          <i>ConceptPortal interface prototype.</i>
        </li>
        <li>
          2024 — Borisov I.R. <LinkTopic text='Exteor 4.9' topic={HelpTopic.EXTEOR} /> supporting schemes exported from
          ConceptPortal.{' '}
          <i>
            ConceptCore (C++) exposed to Python via the <TextURL text='pyconcept' href={external_urls.git_core} />{' '}
            wrapper.
          </i>
        </li>
        <li>
          2024 — Khadanovich B.A., Borisov I.R. End-to-end changes in operational synthesis schemes; prototype web UI for
          conceptual synthesis.<i> Graphical UI prototype for conceptual synthesis.</i>
        </li>
        <li>
          2024 — Vikentiev M.I., Borisov I.R. Modern web UIs for relation visualization in conceptual synthesis.{' '}
          <i>Mixed visualizations of conceptual schemes.</i>
        </li>
      </ul>
    </>
  );
}
