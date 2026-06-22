import { CstType, type AddOrUpdateConstituentaInput } from '../../src';

type BankRow = {
  id: number;
  alias: string;
  cstType: CstType;
  term: string;
  definitionFormal: string;
  convention?: string;
};

function row(input: BankRow): AddOrUpdateConstituentaInput {
  return {
    draft: {
      id: input.id,
      alias: input.alias,
      cstType: input.cstType,
      definitionFormal: input.definitionFormal,
      term: input.term,
      convention: input.convention ?? ''
    }
  };
}

/**
 * Шаблоны «Банка выражений» (Portal rsforms/42, alias БВ).
 * Радикалы R1–R3; без базисных X#. Секции T1–T10.
 */
const rows: BankRow[] = [
  // T1 — управляющие конструкции
  { id: 1, alias: 'T1', cstType: CstType.STATEMENT, term: 'Управляющие конструкции', definitionFormal: '1=1' },
  { id: 2, alias: 'F1', cstType: CstType.FUNCTION, term: 'схема ограниченного выделения', definitionFormal: '[α∈ℬ(R1)] D{ ξ∈α | ξ=ξ }' },
  {
    id: 3,
    alias: 'F2',
    cstType: CstType.FUNCTION,
    term: 'условный переход',
    definitionFormal: '[α∈ℬ(R1)] debool(I{ α | 1=1} ∪ I{ α\\α | 1≠1})'
  },
  { id: 4, alias: 'F3', cstType: CstType.FUNCTION, term: 'рекурсивное определение', definitionFormal: '[α∈ℬ(R1)] R{ ξ:=α | ξ≠∅ | ξ\\ξ }' },

  // T2 — бинарные отношения двух множеств
  { id: 5, alias: 'T2', cstType: CstType.STATEMENT, term: 'Бинарные отношения двух множеств', definitionFormal: '1=1' },
  { id: 6, alias: 'F4', cstType: CstType.FUNCTION, term: 'обратное отношение', definitionFormal: '[σ∈ℬ(R1×R2)] Pr2,1(σ)' },
  { id: 7, alias: 'P1', cstType: CstType.PREDICATE, term: 'свойство всюдуопределенности', definitionFormal: '[α∈ℬ(R1), σ∈ℬ(R1×R2)] Pr1(σ) = α' },
  { id: 8, alias: 'P2', cstType: CstType.PREDICATE, term: 'свойство всюдузначности', definitionFormal: '[α∈ℬ(R2), σ∈ℬ(R1×R2)] Pr2(σ) = α' },
  { id: 9, alias: 'P3', cstType: CstType.PREDICATE, term: 'свойство прямой однозначности', definitionFormal: '[σ∈ℬ(R1×R2)] card(Pr1(σ)) = card(σ)' },
  { id: 10, alias: 'P4', cstType: CstType.PREDICATE, term: 'свойство обратной однозначности', definitionFormal: '[σ∈ℬ(R1×R2)] card(Pr2(σ)) = card(σ)' },
  {
    id: 11,
    alias: 'P5',
    cstType: CstType.PREDICATE,
    term: 'функция',
    definitionFormal: '[α∈ℬ(R1), σ∈ℬ(R1×R2)] card(Pr1(σ)) = card(σ)  & Pr1(σ) = α'
  },
  { id: 12, alias: 'F5', cstType: CstType.FUNCTION, term: 'образ элемента', definitionFormal: '[α∈R1, σ∈ℬ(R1×R2)] debool(Pr2(Fi1[{α}](σ)))' },
  { id: 13, alias: 'F6', cstType: CstType.FUNCTION, term: 'сечение по элементу', definitionFormal: '[α∈R1, σ∈ℬ(R1×R2)] Pr2(Fi1[{α}](σ))' },
  { id: 14, alias: 'F7', cstType: CstType.FUNCTION, term: 'прообраз значения', definitionFormal: '[α∈R2, σ∈ℬ(R1×R2)] debool(Pr1(Fi2[{α}](σ)))' },
  { id: 15, alias: 'F8', cstType: CstType.FUNCTION, term: 'сечение по значению', definitionFormal: '[α∈R2, σ∈ℬ(R1×R2)] Pr1(Fi2[{α}](σ))' },
  { id: 16, alias: 'F9', cstType: CstType.FUNCTION, term: 'образ множества', definitionFormal: '[α∈ℬ(R1), σ∈ℬ(R1×R2)] Pr2(Fi1[α](σ))' },
  { id: 17, alias: 'F10', cstType: CstType.FUNCTION, term: 'прообраз множества', definitionFormal: '[α∈ℬ(R2), σ∈ℬ(R1×R2)] Pr1(Fi2[α](σ))' },
  {
    id: 18,
    alias: 'F11',
    cstType: CstType.FUNCTION,
    term: 'композиция отношений',
    definitionFormal: '[σ1∈ℬ(R1×R2), σ2∈ℬ(R2×R3)] I{(ξ1, ξ3) | (ξ1,ξ2):∈σ1; ξ3:∈Pr2(Fi1[{ξ2}](σ2))}'
  },

  // T3 — бинарные отношения на множестве
  { id: 19, alias: 'T3', cstType: CstType.STATEMENT, term: 'Бинарные отношения на множестве', definitionFormal: '1=1' },
  { id: 20, alias: 'F12', cstType: CstType.FUNCTION, term: 'участники отношения', definitionFormal: '[σ∈ℬ(R1×R1)] Pr1(σ)∪Pr2(σ)' },
  {
    id: 21,
    alias: 'P6',
    cstType: CstType.PREDICATE,
    term: 'свойство полноты (линейности)',
    definitionFormal: '[α∈ℬ(R1), σ∈ℬ(R1×R1)] σ∪Pr2,1(σ)∪Pr1,1(σ)∪Pr2,2(σ) = α×α'
  },
  { id: 22, alias: 'P7', cstType: CstType.PREDICATE, term: 'свойство симметричности', definitionFormal: '[σ∈ℬ(R1×R1)] Pr2,1(σ) = σ' },
  {
    id: 23,
    alias: 'P8',
    cstType: CstType.PREDICATE,
    term: 'свойство антисимметричности',
    definitionFormal: '[σ∈ℬ(R1×R1)] (Pr2,1(σ)∩σ)\\Pr1,1(σ)=∅'
  },
  { id: 24, alias: 'P9', cstType: CstType.PREDICATE, term: 'свойство рефлексивности', definitionFormal: '[σ∈ℬ(R1×R1)] Pr1,1(σ) ⊆ σ' },
  { id: 25, alias: 'P10', cstType: CstType.PREDICATE, term: 'свойство антирефлексивности', definitionFormal: '[σ∈ℬ(R1×R1)] Pr1,1(σ)∩σ=∅' },
  {
    id: 26,
    alias: 'P11',
    cstType: CstType.PREDICATE,
    term: 'свойство транзитивности',
    definitionFormal: '[σ∈ℬ(R1×R1)] ∀(α1,α2),(β1,β2)∈σ (α2=β1 ⇒ (α1,β2)∈σ)'
  },
  {
    id: 27,
    alias: 'P14',
    cstType: CstType.PREDICATE,
    term: 'частичный порядок',
    definitionFormal:
      '[σ∈ℬ(R1×R1)] Pr2,1(σ)∩σ\\Pr1,1(σ)=∅ & (Pr1,1(σ)∩σ=∅ ∨ Pr1,1(σ)⊆σ) & ∀(α1,α2),(β1,β2)∈σ (α2=β1 ⇒ (α1,β2)∈σ)'
  },
  {
    id: 28,
    alias: 'P15',
    cstType: CstType.PREDICATE,
    term: 'линейный порядок',
    definitionFormal:
      '[α∈ℬ(R1), σ∈ℬ(R1×R1)] Pr2,1(σ)∩σ\\Pr1,1(σ) = ∅ & (Pr1,1(σ)∩σ = ∅ ∨ Pr1,1(σ) ⊆ σ) & ∀(α1,α2),(β1,β2)∈σ (α2=β1 ⇒ (α1,β2)∈σ) & σ∪Pr2,1(σ)∪Pr1,1(σ)∪Pr2,2(σ) = α×α'
  },
  {
    id: 29,
    alias: 'F13',
    cstType: CstType.FUNCTION,
    term: 'минимальные элементы порядка на данном подмножестве',
    definitionFormal: '[α∈ℬ(R1), σ∈ℬ(R1×R1)] α \\ Pr2(Fi1,2[α, α](σ))'
  },
  {
    id: 30,
    alias: 'F14',
    cstType: CstType.FUNCTION,
    term: 'наименьший элемент порядка на данном подмножестве',
    definitionFormal:
      '[α∈ℬ(R1), σ∈ℬ(R1×R1)] debool(I{ β | δ1:=Fi1,2[α, α](σ); δ2:=δ1\\Pr1,1(δ1); β:=Pr1(δ2)\\Pr2(δ2) })'
  },
  {
    id: 31,
    alias: 'P17',
    cstType: CstType.PREDICATE,
    term: 'эквивалентность',
    definitionFormal: '[σ∈ℬ(R1×R1)] Pr1,1(σ) ⊆ σ & Pr2,1(σ) = σ & ∀(α1,α2),(β1,β2)∈σ (α2=β1 ⇒ (α1,β2)∈σ)'
  },
  { id: 32, alias: 'P18', cstType: CstType.PREDICATE, term: 'толерантность', definitionFormal: '[σ∈ℬ(R1×R1)] Pr1,1(σ) ⊆ σ & Pr2,1(σ) = σ' },
  { id: 33, alias: 'F15', cstType: CstType.FUNCTION, term: 'класс эквивалентности элемента', definitionFormal: '[α∈R1, σ∈ℬ(R1×R1)] Pr2(Fi1[{α}](σ))' },

  // T4 — цепочки
  { id: 34, alias: 'T4', cstType: CstType.STATEMENT, term: 'Цепочки', definitionFormal: '1=1' },
  {
    id: 35,
    alias: 'P19',
    cstType: CstType.PREDICATE,
    term: 'условие связности цепочки',
    definitionFormal:
      '[σ∈ℬ(R1×R1)] card(Pr1(σ))=card(σ) & card(Pr2(σ))=card(σ) & card(Pr1(σ)\\Pr2(σ))=1 & card(Pr2(σ)\\Pr1(σ))=1'
  },
  { id: 36, alias: 'F16', cstType: CstType.FUNCTION, term: 'начало цепочки', definitionFormal: '[σ∈ℬ(R1×R1)] debool(Pr1(σ) \\ Pr2(σ))' },
  { id: 37, alias: 'F17', cstType: CstType.FUNCTION, term: 'конец цепочки', definitionFormal: '[σ∈ℬ(R1×R1)] debool(Pr2(σ) \\ Pr1(σ))' },
  { id: 38, alias: 'F18', cstType: CstType.FUNCTION, term: 'следующий за данным элемент цепочки', definitionFormal: '[α∈R1, σ∈ℬ(R1×R1)] debool(Pr2(Fi1[{α}](σ)))' },
  { id: 39, alias: 'F19', cstType: CstType.FUNCTION, term: 'предшествующий данному элемент цепочки', definitionFormal: '[α∈R1, σ∈ℬ(R1×R1)] debool(Pr1(Fi2[{α}](σ)))' },

  // T5 — графы
  { id: 40, alias: 'T5', cstType: CstType.STATEMENT, term: 'Графы', definitionFormal: '1=1' },
  {
    id: 41,
    alias: 'P20',
    cstType: CstType.PREDICATE,
    term: 'неориентированный граф',
    definitionFormal: '[γ∈ℬ(R1)×ℬ(R1×R1)] pr2(γ) = Pr2,1(pr2(γ))'
  },
  { id: 42, alias: 'F20', cstType: CstType.FUNCTION, term: 'истоки', definitionFormal: '[σ∈ℬ(R1×R1)] Pr1(σ) \\ Pr2(σ)' },
  { id: 43, alias: 'F21', cstType: CstType.FUNCTION, term: 'стоки', definitionFormal: '[σ∈ℬ(R1×R1)] Pr2(σ) \\ Pr1(σ)' },
  { id: 44, alias: 'F22', cstType: CstType.FUNCTION, term: 'изолированные вершины', definitionFormal: '[α∈ℬ(R1), σ∈ℬ(R1×R1)] α \\ (Pr2(σ) ∪ Pr1(σ))' },
  { id: 45, alias: 'F23', cstType: CstType.FUNCTION, term: 'потребители', definitionFormal: '[α∈R1, σ∈ℬ(R1×R1)] Pr2(Fi1[{α}](σ))' },
  { id: 46, alias: 'F24', cstType: CstType.FUNCTION, term: 'поставщики', definitionFormal: '[α∈R1, σ∈ℬ(R1×R1)] Pr1(Fi2[{α}](σ))' },
  {
    id: 47,
    alias: 'F25',
    cstType: CstType.FUNCTION,
    term: 'зависимые вершины',
    definitionFormal: '[α∈R1, σ∈ℬ(R1×R1)] R{ ξ:=Pr2(Fi1[{α}](σ)) | ξ ∪ Pr2(Fi1[ξ](σ)) }',
    convention: 'вершины, достижимые из данной'
  },
  {
    id: 48,
    alias: 'F26',
    cstType: CstType.FUNCTION,
    term: 'зависимые вершины совокупности',
    definitionFormal: '[α∈ℬ(R1), σ∈ℬ(R1×R1)] R{ ξ:=Pr2(Fi1[α](σ)) | ξ ∪ Pr2(Fi1[ξ](σ)) }'
  },
  {
    id: 49,
    alias: 'F27',
    cstType: CstType.FUNCTION,
    term: 'влияющие вершины',
    definitionFormal: '[α∈R1, σ∈ℬ(R1×R1)] R{ ξ:=Pr1(Fi2[{α}](σ)) | ξ ∪ Pr1(Fi2[ξ](σ)) }',
    convention: 'вершины, из которых данная достижима'
  },
  {
    id: 50,
    alias: 'P22',
    cstType: CstType.PREDICATE,
    term: 'свойство ацикличности',
    definitionFormal: '[σ∈ℬ(R1×R1)] ∀γ∈Pr1(σ) γ∉R{ ξ:=Pr2(Fi1[{γ}](σ)) | ξ ∪ Pr2(Fi1[ξ](σ)) }'
  },
  {
    id: 51,
    alias: 'F29',
    cstType: CstType.FUNCTION,
    term: 'транзитивное замыкание',
    definitionFormal: '[σ∈ℬ(R1×R1)] I{(ξ1, ξ2) | ξ1:∈Pr1(σ); ξ2:∈F25[ξ1, σ]}'
  },

  // T6 — целые числа
  { id: 52, alias: 'T6', cstType: CstType.STATEMENT, term: 'Целые числа', definitionFormal: '1=1' },
  { id: 53, alias: 'F31', cstType: CstType.FUNCTION, term: 'минимум набора чисел', definitionFormal: '[σ∈ℬ(Z)] debool(D{ξ∈σ | ∀α∈σ α ≥ ξ})' },
  { id: 54, alias: 'F32', cstType: CstType.FUNCTION, term: 'максимум набора чисел', definitionFormal: '[σ∈ℬ(Z)] debool(D{ξ∈σ | ∀α∈σ α ≤ ξ})' },
  {
    id: 55,
    alias: 'F33',
    cstType: CstType.FUNCTION,
    term: 'натуральные числа, меньшие или равные данному',
    definitionFormal: '[α∈Z] R{(ξ,σ):=(0, {0}) | ξ<α | (ξ+1, σ ∪ {ξ+1})}'
  },
  { id: 56, alias: 'P25', cstType: CstType.PREDICATE, term: 'набор чисел, удовлетворяющий данному периоду', definitionFormal: '[σ∈ℬ(Z), τ∈Z] ∀α∈σ (α+τ ≤ F32[σ] ⇒ α+τ∈σ)' },
  { id: 57, alias: 'F35', cstType: CstType.FUNCTION, term: 'остаток от деления', definitionFormal: '[α∈Z, β∈Z] R{ξ:=α | ξ≥β & β>0 | ξ-β}' },

  // T7 — последовательности
  { id: 58, alias: 'T7', cstType: CstType.STATEMENT, term: 'Последовательности', definitionFormal: '1=1' },
  {
    id: 59,
    alias: 'P26',
    cstType: CstType.PREDICATE,
    term: 'корректная последовательность (позиции с нуля)',
    definitionFormal: '[σ∈ℬ(R1×Z)] card(σ)=card(Pr2(σ)) & ∀λ∈Pr2(σ) λ < card(σ)'
  },
  { id: 60, alias: 'P28', cstType: CstType.PREDICATE, term: 'подпоследовательность', definitionFormal: '[σ∈ℬ(R1×Z)] card(σ) = card(Pr2(σ))' },
  { id: 61, alias: 'F36', cstType: CstType.FUNCTION, term: 'начало последовательности', definitionFormal: '[σ∈ℬ(R1×Z)] debool(Pr1(Fi2[{0}](σ)))' },
  { id: 62, alias: 'F37', cstType: CstType.FUNCTION, term: 'конец последовательности', definitionFormal: '[σ∈ℬ(R1×Z)] debool(Pr1(Fi2[{card(σ) - 1}](σ)))' },
  {
    id: 63,
    alias: 'F40',
    cstType: CstType.FUNCTION,
    term: 'обращенная последовательность',
    definitionFormal: '[σ∈ℬ(R1×Z)] I{(α, λ) | (α,μ):∈σ; λ := card(σ) - μ - 1}'
  },

  // T8 — групповые операции
  {
    id: 64,
    alias: 'T8',
    cstType: CstType.STATEMENT,
    term: 'Групповые операции',
    definitionFormal: '1=1',
    convention: 'Условия для левых и правых свойств через конкатенацию'
  },
  {
    id: 65,
    alias: 'F42',
    cstType: CstType.FUNCTION,
    term: 'результат операции для данных аргументов',
    definitionFormal: '[α∈R1, β∈R1, σ∈ℬ((R1×R1)×R1)] debool(Pr2(Fi1[{(α,β)}](σ)))'
  },
  {
    id: 66,
    alias: 'F43',
    cstType: CstType.FUNCTION,
    term: 'инвариантные элементы',
    definitionFormal: '[σ∈ℬ((R1×R1)×R1)] D{ξ∈Pr1(Pr1(σ)) | ∀α∈Pr1(Pr1(σ)) (((α,ξ),ξ)∈σ & ((ξ,α),ξ)∈σ)}',
    convention: 'например ноль для операции умножения целых чисел'
  },
  {
    id: 67,
    alias: 'F44',
    cstType: CstType.FUNCTION,
    term: 'нейтральные элементы',
    definitionFormal:
      '[σ∈ℬ((R1×R1)×R1)] D{ξ∈Pr1(Pr1(σ)) | ∀α∈Pr1(Pr1(σ)) (((α,ξ),α)∈σ & ((ξ,α),α)∈σ)}'
  },
  {
    id: 68,
    alias: 'F45',
    cstType: CstType.FUNCTION,
    term: 'идемпотентные элементы',
    definitionFormal: '[σ∈ℬ((R1×R1)×R1)] D{ξ∈Pr1(Pr1(σ)) | ((ξ,ξ),ξ)∈σ}'
  },
  {
    id: 69,
    alias: 'F46',
    cstType: CstType.FUNCTION,
    term: 'обратные элементы для данного элемента',
    definitionFormal:
      '[α∈R1, σ∈ℬ((R1×R1)×R1)] D{ω∈Pr1(Pr1(σ)) | F42[α,ω,σ]∈F44[σ] & F42[ω,α,σ]∈F44[σ]}'
  },
  {
    id: 70,
    alias: 'F47',
    cstType: CstType.FUNCTION,
    term: 'элемент, являющийся данной степенью данного элемента',
    definitionFormal:
      '[α∈R1, λ∈Z, σ∈ℬ((R1×R1)×R1)] pr1(R{(ξ, μ) := (α, 1) | μ<λ & λ>0 | (F42[ξ,α,σ], μ + 1)})'
  },
  {
    id: 71,
    alias: 'P29',
    cstType: CstType.PREDICATE,
    term: 'свойство замкнутости и однозначности',
    definitionFormal: '[α∈ℬ(R1), σ∈ℬ((R1×R1)×R1)] Pr1(σ) = α×α & card(σ) = card(Pr1(σ))'
  },
  {
    id: 72,
    alias: 'P30',
    cstType: CstType.PREDICATE,
    term: 'свойство ассоциативности',
    definitionFormal: '[σ∈ℬ((R1×R1)×R1)] ∀α,β,γ∈Pr1(Pr1(σ)) F42[F42[α,β,σ],γ,σ] = F42[α,F42[β,γ,σ],σ]'
  },
  { id: 73, alias: 'P31', cstType: CstType.PREDICATE, term: 'свойство коммутативности', definitionFormal: '[σ∈ℬ((R1×R1)×R1)] ∀((α1,α2),γ)∈σ ((α2,α1),γ)∈σ' },
  {
    id: 74,
    alias: 'P35',
    cstType: CstType.PREDICATE,
    term: 'полугруппа',
    definitionFormal: '[α∈ℬ(R1), σ∈ℬ((R1×R1)×R1)] P29[α, σ] & P30[σ]',
    convention: 'ассоциативный группоид'
  },
  {
    id: 75,
    alias: 'P36',
    cstType: CstType.PREDICATE,
    term: 'моноид',
    definitionFormal: '[α∈ℬ(R1), σ∈ℬ((R1×R1)×R1)] P29[α, σ] & P30[σ] & card(F44[σ]) > 0',
    convention: 'полугруппа с нейтральным элементом'
  },
  {
    id: 76,
    alias: 'P37',
    cstType: CstType.PREDICATE,
    term: 'группа',
    definitionFormal: '[α∈ℬ(R1), σ∈ℬ((R1×R1)×R1)] P29[α, σ] & P30[σ] & card(F44[σ]) > 0 & ∀ξ∈α card(F46[ξ, σ]) > 0'
  },

  // T9 — кольца
  { id: 77, alias: 'T9', cstType: CstType.STATEMENT, term: 'Кольца', definitionFormal: '1=1', convention: 'Операции по умолчанию — группоиды' },
  {
    id: 78,
    alias: 'P39',
    cstType: CstType.PREDICATE,
    term: 'свойство дистрибутивности φψ',
    definitionFormal:
      '[φ∈ℬ((R1×R1)×R1), ψ∈ℬ((R1×R1)×R1)] ∀α,β,γ∈Pr1(Pr1(φ)) ( F42[α, F42[β, γ, φ], ψ] = F42[F42[α, β, ψ], F42[α, γ, ψ], φ] & F42[F42[α, β, φ], γ, ψ] = F42[F42[α, γ, ψ], F42[β, γ, ψ], φ] )'
  },
  {
    id: 79,
    alias: 'P41',
    cstType: CstType.PREDICATE,
    term: 'полукольцо',
    definitionFormal:
      '[α∈ℬ(R1), φ∈ℬ((R1×R1)×R1), ψ∈ℬ((R1×R1)×R1)] P36[α, φ] & P31[φ] & P35[α, ψ] & P39[φ, ψ]',
    convention: 'сложение — моноид + коммутативность; умножение — полугруппа'
  },

  // T10 — множества подмножеств
  { id: 80, alias: 'T10', cstType: CstType.STATEMENT, term: 'Множества подмножеств', definitionFormal: '1=1' },
  { id: 81, alias: 'P46', cstType: CstType.PREDICATE, term: 'свойство покрытия', definitionFormal: '[α∈ℬ(R1), σ∈ℬℬ(R1)] α⊆red(σ)' },
  { id: 82, alias: 'P47', cstType: CstType.PREDICATE, term: 'свойство попарного непересечения', definitionFormal: '[σ∈ℬℬ(R1)] ∀α,β∈σ (α≠β ⇒ α∩β=∅)' },
  { id: 83, alias: 'P48', cstType: CstType.PREDICATE, term: 'свойство замкнутости по объединению', definitionFormal: '[σ∈ℬℬ(R1)] ∀α,β∈σ α∪β∈σ' },
  {
    id: 84,
    alias: 'P52',
    cstType: CstType.PREDICATE,
    term: 'разбиение',
    definitionFormal: '[α∈ℬ(R1), σ∈ℬℬ(R1)] red(σ)=α & card(σ)>1 & ∅∉σ & ∀ξ1,ξ2∈σ (ξ1≠ξ2 ⇒ ξ1∩ξ2=∅)'
  },
  { id: 85, alias: 'F48', cstType: CstType.FUNCTION, term: 'фильтр по вхождению элемента', definitionFormal: '[α∈R1, σ∈ℬℬ(R1)] D{ξ∈σ | α∈ξ}' },
  { id: 86, alias: 'F49', cstType: CstType.FUNCTION, term: 'фильтр по подмножеству', definitionFormal: '[α∈ℬ(R1), σ∈ℬℬ(R1)] D{ξ∈σ | α⊆ξ}' },
  { id: 87, alias: 'F50', cstType: CstType.FUNCTION, term: 'фильтр по надмножеству', definitionFormal: '[α∈ℬ(R1), σ∈ℬℬ(R1)] D{ξ∈σ | ξ⊆α}' }
];

export const BANK_DRAFTS: AddOrUpdateConstituentaInput[] = rows.map(row);
