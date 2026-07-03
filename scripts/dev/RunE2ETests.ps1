# Run E2E tests

$root = Resolve-Path -Path "$PSScriptRoot\..\.."

function RunTests() {
  Set-Location $root
  & pnpm --filter @rsconcept/domain run build
  & pnpm --filter frontend run test:e2e
}

RunTests
