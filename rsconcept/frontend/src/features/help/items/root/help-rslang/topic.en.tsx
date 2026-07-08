import { useTx } from '@/i18n';

import { external_urls, videos } from '@/utils/constants';

import { BadgeVideo } from '../../../components/badge-video';
import { LinkTopic } from '../../../components/link-topic';
import { Subtopics } from '../../../components/subtopics';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rslang.short')}</h1>
      <p>
        Formal notation (<i>explication</i>) of conceptual schemes uses <b>RSLang</b> — the language of rodo-structural
        explication. This section explains the main notions and formal constructs. At its core RSLang is first-order
        logic; all additional notation builds on the membership predicate <code>x∈y</code>.
      </p>
      <p>Strict identifier rules apply to concept names, local variables, and literals.</p>
      <p>
        RSLang constructs split into set-theoretic expressions and logical expressions. Loosely, a set-theoretic
        expression yields an element of a given <LinkTopic topic={HelpTopic.RSL_TYPIFICATION} text='stage' />, while a
        logical expression yields TRUE or FALSE.
      </p>
      <p>
        Parameterized and template expressions are also allowed; their values and typing depend on parameters. Such
        expressions appear in definitions of{' '}
        <LinkTopic topic={HelpTopic.CC_CONSTITUENTA} text='term functions and predicate functions' />.
      </p>
      <p>Expressions that reshape operand stages are called structural expressions.</p>
      <p>
        More involved constructs that specify a set by selecting members—imperatively or recursively—are covered
        separately.
      </p>

      <Subtopics headTopic={HelpTopic.RSLANG} />

      <div className='dense'>
        <p>Introductory materials on RSLang:</p>
        <p>
          1. <BadgeVideo className='inline-icon' video={videos.explication} /> Video: brief introduction to the formal
          apparatus
        </p>
        <p>
          2.{' '}
          <a className='underline' href={external_urls.ponomarev}>
            Text: textbook by I. N. Ponomarev
          </a>
        </p>
        <p>
          3.{' '}
          <a className='underline' href={external_urls.full_course}>
            Video: fourth-year lectures (spring semester 2022–23)
          </a>
        </p>
      </div>
    </>
  );
}
