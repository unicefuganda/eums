from eums.rapid_pro.fake_response import FakeResponse


class RunsEndpoint():
    def __init__(self):
        self.last_run_id = 0

    def post(self, data=None):
        phone = data.get('phone', '+256 772 123456')
        self.last_run_id += 1
        return FakeResponse([{"run": self.last_run_id, "phone": phone}], 201)

    def clear(self):
        self.last_run_id = 0


runs = RunsEndpoint()