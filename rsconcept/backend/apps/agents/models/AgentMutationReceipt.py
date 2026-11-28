''' Durable idempotency claims committed with their Portal mutations. '''
from django.conf import settings
from django.db import models


class AgentMutationReceipt(models.Model):
    ''' One request per account, mutation kind and idempotency key. '''

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    operation = models.CharField(max_length=32)
    key = models.CharField(max_length=128)
    digest = models.CharField(max_length=64)
    target_id = models.PositiveBigIntegerField(null=True)
    version_id = models.PositiveBigIntegerField(null=True)
    revision = models.DateTimeField(null=True)
    target_metadata = models.JSONField(default=dict)

    class Meta:
        ''' A Portal account can reuse identifiers across operation kinds. '''
        constraints = [models.UniqueConstraint(
            fields=['owner', 'operation', 'key'], name='unique_agent_mutation_request',
        )]
