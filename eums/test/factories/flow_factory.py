import factory

from eums.models import Flow


class FlowFactory(factory.DjangoModelFactory):
    class Meta:
        model = Flow

    # TODO: to be removed
    rapid_pro_id = 1234
    label = factory.Sequence(lambda n: "RUNNABLE_TYPE_{0}".format(n))

    @factory.post_generation
    def questions(self, create, extracted, **_):
        if not create:
            return

        if extracted:
            # A list of groups were passed in, use them
            self.questions.add(*extracted)
