from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from django.contrib.auth.models import User

class UserSerialiser(serializers.ModelSerializer):
    consignee = serializers.PrimaryKeyRelatedField(source='user_profile.consignee.id', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'consignee')


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerialiser


userRouter = DefaultRouter()
userRouter.register(r'user', UserViewSet)
