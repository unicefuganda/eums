class RunsEndpoint():
    def __init__(self):
        pass

    @staticmethod
    def post(data=None):
        phone = data.get('phone', '+256 772 123456')
        return [{"run": 1, "phone": phone}]


runs = RunsEndpoint()