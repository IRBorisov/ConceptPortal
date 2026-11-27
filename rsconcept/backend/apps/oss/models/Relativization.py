''' Configuration and constituent provenance for a relativization. '''
from django.db.models import CASCADE, SET_NULL, CharField, ForeignKey, JSONField, Model, OneToOneField


class Relativization(Model):
    ''' A unary transformation attached to an OSS operation. '''
    operation = OneToOneField('oss.Operation', on_delete=CASCADE, related_name='relativization')
    source = ForeignKey('library.LibraryItem', on_delete=CASCADE, related_name='source_relativizations')
    parameters = JSONField(default=dict)
    passport = JSONField(default=dict)
    attribution = JSONField(default=list)


class RelativizationRow(Model):
    ''' One calculated result and the fields owned by the result editor. '''
    relativization = ForeignKey(Relativization, on_delete=CASCADE, related_name='rows')
    # Retain the result link until refresh removes the obsolete projection row.
    origin = ForeignKey('rsform.Constituenta', on_delete=SET_NULL, null=True, related_name='+')
    result = OneToOneField('rsform.Constituenta', on_delete=CASCADE, related_name='projection_row')
    role = CharField(max_length=14)
    text_overrides = JSONField(default=list)
