class FakeResponse():
    def __init__(self, json_response, status_code):
        self.json_response = json_response
        self.status_code = status_code

    def json(self):
        return self.json_response
