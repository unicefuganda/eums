from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from django.contrib.auth.models import User

class UserSerialiser(serializers.ModelSerializer):
    consignee = serializers.SerializerMethodField('get_consignee')

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'consignee')

    def get_consignee(self, user):
        try:
            return user.user_profile.consignee_id
        except:
            return None

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerialiser


userRouter = DefaultRouter()
userRouter.register(r'user', UserViewSet)
