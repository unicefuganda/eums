from unittest import TestCase

from eums.rapid_pro.flow_request_template import FlowRequestTemplate


class TestFlowRequestTemplate(TestCase):
    template = FlowRequestTemplate()

    def test_should_build_simple_template(self):
        self.template.payload = {'flow': '${flow_name}'}

        self.assertDictEqual(self.template.build(flow_name='flow name'), {'flow': 'flow name'})

    def test_should_replace_list_in_template(self):
        self.template.payload = {'flow': ['${flow_name}']}

        self.assertDictEqual(self.template.build(flow_name='flow name'), {'flow': ['flow name']})

    def test_should_build_dict_in_template(self):
        self.template.payload = {'flow': {'test': '${flow_name}'}}

        self.assertDictEqual(self.template.build(flow_name='flow name'), {'flow': {'test': 'flow name'}})

    def test_should_build_dict_with_function(self):
        self.template.payload = {'flow_id': {'__handler__': lambda flow_id: int(flow_id), '__value__': '${flow_id}'}}

        self.assertDictEqual(self.template.build(flow_id=12), {'flow_id': 12})

    def test_should_build_dict_with_original_value(self):
        self.template.payload = {'flow_id': '${flow_id}'}

        self.assertDictEqual(self.template.build(flow_id=12), {'flow_id': 12})

    def test_should_build_list_in_list(self):
        self.template.payload = {'flow_names': [['${flow_name}']]}

        self.assertDictEqual(self.template.build(flow_name='name'), {'flow_names': [['name']]})
