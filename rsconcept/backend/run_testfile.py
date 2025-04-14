import os
import runpy
import sys

# Build the module path from the test file
filepath = sys.argv[1]
project_root = os.path.dirname(__file__)
relpath = os.path.relpath(filepath, project_root)
module_path = relpath.replace('/', '.').replace('\\', '.').removesuffix('.py')

# Run manage.py in-process so breakpoints work
sys.argv = ["manage.py", "test", module_path]
runpy.run_path("manage.py", run_name="__main__")
