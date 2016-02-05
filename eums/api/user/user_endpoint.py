from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.permissions.view_user_permission import ViewUserPermission


class UserSerialiser(serializers.ModelSerializer):
    consignee = serializers.PrimaryKeyRelatedField(source='user_profile.consignee.id', read_only=True)
    groups = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'consignee', 'groups')


class UserViewSet(ModelViewSet):
    permission_classes = (DjangoModelPermissions, ViewUserPermission)

    queryset = User.objects.all()
    serializer_class = UserSerialiser

userRouter = DefaultRouter()
userRouter.register(r'user', UserViewSet)
