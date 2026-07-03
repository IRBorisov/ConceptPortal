# Run linters

$root = Resolve-Path -Path "$PSScriptRoot\..\.."
$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"

function RunLinters() {
  LintDomain
  LintRstool
  LintRstoolMcp
  LintBackend
  LintFrontend
}

function LintBackend() {
  Set-Location $backend
  $env:DJANGO_SETTINGS_MODULE = "project.settings"
  & uv run pylint project apps
  & uv run mypy project apps --show-traceback
}

function LintDomain() {
  Set-Location $root
  & pnpm --filter @rsconcept/domain run lint
}

function LintFrontend() {
  Set-Location $root
  & pnpm --filter frontend run lint
}

function LintRstool() {
  Set-Location $root
  & pnpm --filter @rsconcept/rstool run typecheck
}

function LintRstoolMcp() {
  Set-Location $root
  & pnpm --filter @rsconcept/rstool-mcp run typecheck
}

RunLinters
