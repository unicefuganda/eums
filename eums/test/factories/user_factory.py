from django.contrib.auth.models import User
import factory


class UserFactory(factory.Factory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: 'user{0}'.format(n))
    first_name = 'User',
    last_name = factory.Sequence(lambda n: '{0}'.format(n))
    email = factory.Sequence(lambda n: 'user{0}@example.com'.format(n)),