from rest_framework.exceptions import APIException


class ForbiddenException(APIException):
    def __init__(self, message=None):
        if message:
            self.default_detail = message
        super(ForbiddenException, self).__init__()

    status_code = 403
    default_detail = "You do not have permission to perform this action"