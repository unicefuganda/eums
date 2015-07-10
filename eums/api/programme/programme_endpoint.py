from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import Programme


class ProgrammeSerialiser(serializers.ModelSerializer):
    salesorder_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Programme
        fields = ('id', 'name', 'salesorder_set')


class ProgrammeViewSet(ModelViewSet):
    queryset = Programme.objects.all().order_by('name')
    serializer_class = ProgrammeSerialiser


programmeRouter = DefaultRouter()
programmeRouter.register(r'programme', ProgrammeViewSet)
