from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import Programme


class ProgrammeSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Programme
        fields = ('id', 'name', 'focal_person')


class ProgrammeViewSet(ModelViewSet):
    queryset = Programme.objects.all()
    serializer_class = ProgrammeSerialiser


programmeRouter = DefaultRouter()
programmeRouter.register(r'programme', ProgrammeViewSet)
