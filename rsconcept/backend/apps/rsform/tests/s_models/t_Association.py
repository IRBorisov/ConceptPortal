''' Testing models: Association. '''
from django.db.utils import IntegrityError
from django.test import TestCase

from apps.rsform.models import Association, Constituenta, CstType, RSForm


class TestAssociation(TestCase):
    ''' Testing Association model. '''

    def setUp(self):
        self.schema = RSForm.create(title='Test1')

        # Create test constituents
        self.container1 = Constituenta.objects.create(
            alias='C1',
            schema=self.schema.model,
            order=1,
            cst_type=CstType.NOMINAL
        )
        self.associate1 = Constituenta.objects.create(
            alias='A1',
            schema=self.schema.model,
            order=2,
            cst_type=CstType.BASE
        )

    def test_str(self):
        ''' Test string representation. '''
        association = Association.objects.create(
            container=self.container1,
            associate=self.associate1
        )
        expected_str = f'{self.container1} -> {self.associate1}'
        self.assertEqual(str(association), expected_str)

    def test_create_association(self):
        ''' Test basic association creation. '''
        association = Association.objects.create(
            container=self.container1,
            associate=self.associate1
        )
        self.assertEqual(association.container, self.container1)
        self.assertEqual(association.associate, self.associate1)
        self.assertIsNotNone(association.id)

    def test_unique_constraint(self):
        ''' Test unique constraint on container and associate. '''
        # Create first association
        Association.objects.create(
            container=self.container1,
            associate=self.associate1
        )

        # Try to create duplicate association
        with self.assertRaises(IntegrityError):
            Association.objects.create(
                container=self.container1,
                associate=self.associate1
            )

    def test_container_not_null(self):
        ''' Test container field cannot be null. '''
        with self.assertRaises(IntegrityError):
            Association.objects.create(
                container=None,
                associate=self.associate1
            )

    def test_associate_not_null(self):
        ''' Test associate field cannot be null. '''
        with self.assertRaises(IntegrityError):
            Association.objects.create(
                container=self.container1,
                associate=None
            )

    def test_cascade_delete_container(self):
        ''' Test cascade delete when container is deleted. '''
        association = Association.objects.create(
            container=self.container1,
            associate=self.associate1
        )
        association_id = association.id

        # Delete the container
        self.container1.delete()

        # Association should be deleted due to CASCADE
        with self.assertRaises(Association.DoesNotExist):
            Association.objects.get(id=association_id)

    def test_cascade_delete_associate(self):
        ''' Test cascade delete when associate is deleted. '''
        association = Association.objects.create(
            container=self.container1,
            associate=self.associate1
        )
        association_id = association.id

        # Delete the associate
        self.associate1.delete()

        # Association should be deleted due to CASCADE
        with self.assertRaises(Association.DoesNotExist):
            Association.objects.get(id=association_id)

    def test_related_names(self):
        ''' Test related names for foreign key relationships. '''
        association = Association.objects.create(
            container=self.container1,
            associate=self.associate1
        )

        # Test container related name
        container_associations = self.container1.as_container.all()
        self.assertEqual(len(container_associations), 1)
        self.assertEqual(container_associations[0], association)

        # Test associate related name
        associate_associations = self.associate1.as_associate.all()
        self.assertEqual(len(associate_associations), 1)
        self.assertEqual(associate_associations[0], association)

    def test_multiple_associations_same_container(self):
        ''' Test multiple associations with same container. '''
        associate3 = Constituenta.objects.create(
            alias='A3',
            schema=self.schema.model,
            order=3,
            cst_type=CstType.BASE
        )

        association1 = Association.objects.create(
            container=self.container1,
            associate=self.associate1
        )
        association2 = Association.objects.create(
            container=self.container1,
            associate=associate3
        )

        container_associations = self.container1.as_container.all()
        self.assertEqual(len(container_associations), 2)
        self.assertIn(association1, container_associations)
        self.assertIn(association2, container_associations)

    def test_multiple_associations_same_associate(self):
        ''' Test multiple associations with same associate. '''
        container3 = Constituenta.objects.create(
            alias='C3',
            schema=self.schema.model,
            order=3,
            cst_type=CstType.NOMINAL
        )

        association1 = Association.objects.create(
            container=self.container1,
            associate=self.associate1
        )
        association2 = Association.objects.create(
            container=container3,
            associate=self.associate1
        )

        associate_associations = self.associate1.as_associate.all()
        self.assertEqual(len(associate_associations), 2)
        self.assertIn(association1, associate_associations)
        self.assertIn(association2, associate_associations)

    def test_meta_unique_together(self):
        ''' Test Meta class unique_together constraint. '''
        unique_together = Association._meta.unique_together
        self.assertEqual(len(unique_together), 1)
        self.assertIn(('container', 'associate'), unique_together)
