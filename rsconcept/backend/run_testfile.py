import os
import sys

filepath = sys.argv[1]
project_root = os.path.join(os.path.dirname(__file__))
relpath = os.path.relpath(filepath, project_root)
module_path = relpath.replace('/', '.').replace('\\', '.').rstrip('.py')

os.system(f"python manage.py test {module_path}")
