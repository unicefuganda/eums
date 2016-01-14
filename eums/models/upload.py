from django.db import models
from django.forms import ModelForm
from eums.models import DistributionPlan
from eums.models.time_stamped_model import TimeStampedModel


class Upload(TimeStampedModel):
    file = models.FileField(upload_to='photos/%Y/%m/%d')
    plan = models.ForeignKey(DistributionPlan, null=True)

    class Meta:
        app_label = 'eums'


class UploadForm(ModelForm):
    class Meta:
        model = Upload
        fields = '__all__'
