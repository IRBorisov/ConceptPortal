''' Guard: every t_*.py test module must be reachable from its app's tests package.

Test modules are named t_*.py, which Django's default discovery pattern skips, so they run
only when star-imported by the package __init__ chain. This check fails on forgotten imports.
'''
import importlib
import inspect
import unittest
from pathlib import Path

from django.test import SimpleTestCase

APPS_DIR = Path(__file__).resolve().parent.parent / 'apps'


class TestTestModulesRegistered(SimpleTestCase):
    ''' Every test case class must be exported by apps.<app>.tests. '''

    def test_all_test_modules_registered(self):
        missing: list[str] = []
        for tests_dir in sorted(APPS_DIR.glob('*/tests')):
            app = tests_dir.parent.name
            root = importlib.import_module(f'apps.{app}.tests')
            for path in sorted(tests_dir.rglob('t_*.py')):
                relative = path.relative_to(tests_dir).with_suffix('')
                module_name = f'apps.{app}.tests.' + '.'.join(relative.parts)
                module = importlib.import_module(module_name)
                for name, cls in inspect.getmembers(module, inspect.isclass):
                    if cls.__module__ != module_name or not issubclass(cls, unittest.TestCase):
                        continue
                    if getattr(root, name, None) is not cls:
                        missing.append(f'{module_name}.{name}')
        self.assertEqual(missing, [], 'Test classes not imported by their tests package __init__')
