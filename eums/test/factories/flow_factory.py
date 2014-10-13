import factory

from eums.models import Flow, DistributionPlanNode as Node


class FlowFactory(factory.DjangoModelFactory):
    class Meta:
        model = Flow

    rapid_pro_id = 1234
    for_node_type = Node.END_USER

    @factory.post_generation
    def questions(self, create, extracted, **_):
        if not create:
            return

        if extracted:
            # A list of groups were passed in, use them
            self.questions.add(*extracted)
