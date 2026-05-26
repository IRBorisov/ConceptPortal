# rstool docs

Standalone English reference distilled from the Portal manuals and `CONTEXT.md`. Bundled with `@rsconcept/rstool` so external agents never need to read the Portal frontend source tree.

| File | Read when |
|------|-----------|
| [`DOMAIN.md`](DOMAIN.md) | You need the Concept Portal vocabulary (constituenta, conceptual schema/model, OSS, synthesis). |
| [`CONSTITUENTA.md`](CONSTITUENTA.md) | You are upserting constituents — fields, `cstType` table, validation rules, recommended order. |
| [`SYNTAX.md`](SYNTAX.md) | You are constructing RSLang expressions — operators, quantifiers, parameterised functions, examples. |
| [`TYPIFICATION.md`](TYPIFICATION.md) | You are interpreting `AnalysisResult.type` / `valueClass` or constructing template expressions with radicals. |
| [`DIAGNOSTICS.md`](DIAGNOSTICS.md) | You received `analysis.diagnostics` and need to map error codes to fixes. |
| [`PORTAL-API.md`](PORTAL-API.md) | You need to fetch an existing RSForm/OSS/RSModel from the live Portal REST API. |
| [`GRAMMAR-REF.md`](GRAMMAR-REF.md) | You need a compact token / precedence table; the full grammar lives in `@rsconcept/domain`. |

For the rstool agent contract itself (methods, types, stdio protocol) see [`../skills/rslang-rstool/REFERENCE.md`](../skills/rslang-rstool/REFERENCE.md).
