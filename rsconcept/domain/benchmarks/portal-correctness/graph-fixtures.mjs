/** Four vertices running the same neighborhood rounds as the public Portal model. */
const definitions = [
  ['X1', 'basic', ''],
  ['S1', 'structure', 'ℬ(X1×X1)'],
  ['F1', 'function', '[α∈X1] Pr2(Fi1[{α}](S1))'],
  ['F2', 'function', '[α∈ℬ(X1)] Pr2(Fi1[α](S1))'],
  ['S2', 'structure', 'ℬ(X1)'],
  ['D3', 'term', 'X1\\S2'],
  ['F3', 'function', '[σ∈ℬ(X1)] σ∪F2[σ]'],
  ['D4', 'term', 'I{(ξ, μ) | ξ:∈D3; μ:=card(S2∩F1[ξ])}'],
  ['F4', 'function', '[α∈D3] debool(Pr2(Fi1[{α}](D4)))'],
  ['D5', 'term', 'Pr1(Fi2[{0}](D4))'],
  ['D6', 'term', 'Fi1,2[D5,D5](S1)'],
  ['F5', 'function', '[σ∈ℬ(D5)] Pr2(Fi1[σ](D6))'],
  ['F6', 'function', '[σ∈ℬ(D5)] pr2(R{(ξ,β):=(σ,∅) | F5[ξ]≠∅ | (F5[ξ]\\(β∪ξ), β∪F5[ξ])})'],
  ['F7', 'function', '[σ∈ℬ(X1)] σ∪F3[F6[σ∩D5]]'],
  ['S3', 'structure', 'ℬ(X1)'],
  ['F9', 'function', '[σ∈ℬ(D3)] I{(α, γ) | α:∈σ\\D5; γ:=F1[α]\\σ; card(γ)=F4[α]}'],
  ['F10', 'function', '[σ∈ℬ(D3)] red(Pr2(F9[σ]))'],
  ['F11', 'function', '[σ∈ℬ(D3)] F10[σ]∪σ'],
  ['F12', 'function', '[σ∈ℬ(D3)] I{(α, δ) | α:∈σ\\D5; γ:=F1[α]; card(γ∩F10[σ])=F4[α]; δ:=γ\\F11[σ]; δ≠∅}'],
  ['F13', 'function', '[σ∈ℬ(D3)] red(Pr2(F12[σ]))'],
  ['D7', 'term', 'debool(I{(S3, 0, {(S3, 0)}) | S3∩D5=∅}  ∪ I{(γ, 1, {(S3, 0), (γ, 1)}) | S3∩D5≠∅; γ:=F7[S3]∪F3[S3]})'],
  ['D8', 'term', 'R{(σ, μ, λ):=D7 | F13[σ]≠∅ | (σ∪F7[F13[σ]], μ+1, λ∪{(σ∪F7[F13[σ]], μ+1)})}']
];

const constituentIds = Object.fromEntries(definitions.map(([alias], index) => [alias, index + 1]));
const storedTuple = -111;

const metadata = {
  access_policy: 'public',
  description: '',
  editors: [],
  location: '/S',
  owner: null,
  read_only: true,
  time_create: '2026-01-01T00:00:00Z',
  time_update: '2026-01-01T00:00:00Z',
  visible: true
};

export function roundFixture(initial, { revealBlockedNeighbor = false } = {}) {
  const schemaDetails = {
    ...metadata,
    id: 1,
    alias: 'rounds',
    item_type: 'rsform',
    title: 'Neighborhood inference rounds',
    attribution: [],
    inheritance: [],
    is_produced: false,
    oss: [],
    models: [],
    versions: [],
    items: definitions.map(([alias, cst_type, definition_formal]) => ({
      id: constituentIds[alias],
      alias,
      cst_type,
      definition_formal,
      definition_raw: '',
      definition_resolved: '',
      term_raw: '',
      term_resolved: '',
      term_forms: [],
      convention: '',
      crucial: false,
      typification_manual: '',
      value_is_property: false
    }))
  };
  const arcs = [
    [1, revealBlockedNeighbor ? 3 : 4],
    [2, 3],
    [2, 4]
  ].map(([from, to]) => [storedTuple, from, to]);
  const modelDetails = {
    ...metadata,
    id: 2,
    alias: 'rounds-model',
    item_type: 'rsmodel',
    title: 'Neighborhood inference fixture',
    schema: schemaDetails.id,
    items: [
      { id: constituentIds.X1, type: 'basic', value: { 1: 'one', 2: 'two', 3: 'three', 4: 'four' } },
      { id: constituentIds.S1, type: 'ℬ(X1×X1)', value: arcs },
      { id: constituentIds.S2, type: 'ℬ(X1)', value: [4] },
      { id: constituentIds.S3, type: 'ℬ(X1)', value: [...initial] }
    ]
  };
  return { schemaDetails, modelDetails, constituentId: constituentIds.D8 };
}
