# Generate DOT file for DB structure
$backend = Resolve-Path -Path "${PSScriptRoot}\..\..\rsconcept\backend"

function GenerateDOT() {
  Set-Location $backend

  $djangoSrc = "${backend}\manage.py"

  & uv run python $djangoSrc graph_models -o visualizeDB.dot

  notepad.exe "${backend}\visualizeDB.dot"
  Start-Process "https://dreampuf.github.io/GraphvizOnline"
}

GenerateDOT