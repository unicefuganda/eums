from eums.rapid_pro.fake_response import FakeResponse

last_run_id = 0


def post(data=None):
    global last_run_id
    last_run_id += 1
    phone = data.get('phone', '+256 772 123456')
    response = FakeResponse([{"run": last_run_id, "phone": phone}], 201)
    print "*" * 20, "Post called. Going to return fake response", response, "*" * 20
    return response


def clear():
    global last_run_id
    last_run_id = 0