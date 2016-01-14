import factory

from eums.models.upload import Upload
from eums.test.factories.delivery_factory import DeliveryFactory


class FileUploadFactory(factory.DjangoModelFactory):
    class Meta:
        model = Upload

    plan = factory.SubFactory(DeliveryFactory)
    file = 'photos/2016/01/01/mock.jpg'
