# Generate DOT file for DB structure
$backend = Resolve-Path -Path "${PSScriptRoot}\..\..\rsconcept\backend"

function GenerateDOT() {
  Set-Location $backend

  $python = "${backend}\venv\Scripts\python.exe"
  $djangoSrc = "${backend}\manage.py"

  & $python $djangoSrc graph_models -o visualizeDB.dot

  notepad.exe "${backend}\visualizeDB.dot"
  Start-Process "https://dreampuf.github.io/GraphvizOnline"
}

GenerateDOT