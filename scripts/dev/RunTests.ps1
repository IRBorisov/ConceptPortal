# Run tests

$root = Resolve-Path -Path "$PSScriptRoot\..\.."
$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"

function RunTests() {
  TestDomain
  TestRstool
  TestRstoolMcp
  TestBackend
  TestFrontend
}

function TestBackend() {
  $djangoSrc = "$backend\manage.py"

  Set-Location $backend
  & uv run python $djangoSrc check
  & uv run python $djangoSrc test
}

function TestDomain() {
  Set-Location $root
  & pnpm --filter @rsconcept/domain run typecheck
  & pnpm --filter @rsconcept/domain test
}

function TestFrontend() {
  Set-Location $root
  & pnpm --filter @rsconcept/domain run build
  & pnpm --filter frontend run typecheck
  & pnpm --filter frontend test
}

function TestRstool() {
  Set-Location $root
  & pnpm --filter @rsconcept/domain run build
  & pnpm --filter @rsconcept/rstool run typecheck
  & pnpm --filter @rsconcept/rstool test
}

function TestRstoolMcp() {
  Set-Location $root
  & pnpm --filter @rsconcept/domain run build
  & pnpm --filter @rsconcept/rstool run build
  & pnpm --filter @rsconcept/rstool-mcp run typecheck
  & pnpm --filter @rsconcept/rstool-mcp test
}

RunTests
