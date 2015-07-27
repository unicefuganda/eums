import factory

from eums.models import Flow, Runnable


class FlowFactory(factory.DjangoModelFactory):
    class Meta:
        model = Flow

    rapid_pro_id = 1234
    for_runnable_type = Runnable.END_USER

    @factory.post_generation
    def questions(self, create, extracted, **_):
        if not create:
            return

        if extracted:
            # A list of groups were passed in, use them
            self.questions.add(*extracted)
