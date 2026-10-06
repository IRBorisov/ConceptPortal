''' Test runner: discover test modules by the project naming convention. '''
from django.test.runner import DiscoverRunner

TEST_FILE_PATTERN = 't_*.py'


class PortalTestRunner(DiscoverRunner):
    ''' Discover ``t_*.py`` modules so test files need no manual registration. '''

    @classmethod
    def add_arguments(cls, parser):
        super().add_arguments(parser)
        parser.set_defaults(pattern=TEST_FILE_PATTERN)
