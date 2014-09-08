from django.db import models


class SupplyPlan(models.Model):
    program_name = models.TextField()

    class Meta:
        app_label = 'eums'
