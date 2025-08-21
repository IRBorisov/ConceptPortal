''' Testing models: Association. '''
from django.db.utils import IntegrityError
from django.test import TestCase

from apps.rsform.models import Attribution, Constituenta, CstType, RSForm


class TestAttribution(TestCase):
    ''' Testing Attribution model. '''

    def setUp(self):
        self.schema = RSForm.create(title='Test1')

        # Create test constituents
        self.container1 = Constituenta.objects.create(
            alias='C1',
            schema=self.schema.model,
            order=1,
            cst_type=CstType.NOMINAL
        )
        self.attribute1 = Constituenta.objects.create(
            alias='A1',
            schema=self.schema.model,
            order=2,
            cst_type=CstType.BASE
        )

    def test_str(self):
        ''' Test string representation. '''
        attribution = Attribution.objects.create(
            container=self.container1,
            attribute=self.attribute1
        )
        expected_str = f'{self.container1} -> {self.attribute1}'
        self.assertEqual(str(attribution), expected_str)

    def test_create_attribution(self):
        ''' Test basic Attribution creation. '''
        attr = Attribution.objects.create(
            container=self.container1,
            attribute=self.attribute1
        )
        self.assertEqual(attr.container, self.container1)
        self.assertEqual(attr.attribute, self.attribute1)
        self.assertIsNotNone(attr.id)

    def test_unique_constraint(self):
        ''' Test unique constraint on container and attribute. '''
        # Create first Attribution
        Attribution.objects.create(
            container=self.container1,
            attribute=self.attribute1
        )

        # Try to create duplicate Attribution
        with self.assertRaises(IntegrityError):
            Attribution.objects.create(
                container=self.container1,
                attribute=self.attribute1
            )

    def test_container_not_null(self):
        ''' Test container field cannot be null. '''
        with self.assertRaises(IntegrityError):
            Attribution.objects.create(
                container=None,
                attribute=self.attribute1
            )

    def test_attribute_not_null(self):
        ''' Test attribute field cannot be null. '''
        with self.assertRaises(IntegrityError):
            Attribution.objects.create(
                container=self.container1,
                attribute=None
            )

    def test_cascade_delete_container(self):
        ''' Test cascade delete when container is deleted. '''
        attribution = Attribution.objects.create(
            container=self.container1,
            attribute=self.attribute1
        )
        association_id = attribution.id

        # Delete the container
        self.container1.delete()

        # Attribution should be deleted due to CASCADE
        with self.assertRaises(Attribution.DoesNotExist):
            Attribution.objects.get(id=association_id)

    def test_cascade_delete_attribute(self):
        ''' Test cascade delete when attribute is deleted. '''
        attribution = Attribution.objects.create(
            container=self.container1,
            attribute=self.attribute1
        )
        association_id = attribution.id

        # Delete the attribute
        self.attribute1.delete()

        # Attribution should be deleted due to CASCADE
        with self.assertRaises(Attribution.DoesNotExist):
            Attribution.objects.get(id=association_id)

    def test_related_names(self):
        ''' Test related names for foreign key relationships. '''
        attribution = Attribution.objects.create(
            container=self.container1,
            attribute=self.attribute1
        )

        # Test container related name
        container_associations = self.container1.as_container.all()
        self.assertEqual(len(container_associations), 1)
        self.assertEqual(container_associations[0], attribution)

        # Test attribute related name
        attribute_associations = self.attribute1.as_attribute.all()
        self.assertEqual(len(attribute_associations), 1)
        self.assertEqual(attribute_associations[0], attribution)

    def test_multiple_attributions_same_container(self):
        ''' Test multiple Attributions with same container. '''
        attribute3 = Constituenta.objects.create(
            alias='A3',
            schema=self.schema.model,
            order=3,
            cst_type=CstType.BASE
        )

        attr1 = Attribution.objects.create(
            container=self.container1,
            attribute=self.attribute1
        )
        attr2 = Attribution.objects.create(
            container=self.container1,
            attribute=attribute3
        )

        container_associations = self.container1.as_container.all()
        self.assertEqual(len(container_associations), 2)
        self.assertIn(attr1, container_associations)
        self.assertIn(attr2, container_associations)

    def test_multiple_attributions_same_attribute(self):
        ''' Test multiple Attributions with same attribute. '''
        container3 = Constituenta.objects.create(
            alias='C3',
            schema=self.schema.model,
            order=3,
            cst_type=CstType.NOMINAL
        )

        attr1 = Attribution.objects.create(
            container=self.container1,
            attribute=self.attribute1
        )
        attr2 = Attribution.objects.create(
            container=container3,
            attribute=self.attribute1
        )

        attribute_associations = self.attribute1.as_attribute.all()
        self.assertEqual(len(attribute_associations), 2)
        self.assertIn(attr1, attribute_associations)
        self.assertIn(attr2, attribute_associations)

    def test_meta_unique_together(self):
        ''' Test Meta class unique_together constraint. '''
        unique_together = Attribution._meta.unique_together
        self.assertEqual(len(unique_together), 1)
        self.assertIn(('container', 'attribute'), unique_together)
