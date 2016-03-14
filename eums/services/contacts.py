class ContactService:
    def __init__(self, **kwargs):
        self._id = kwargs.get('_id')
        self.first_name = kwargs.get('firstName')
        self.last_name = kwargs.get('lastName')
        self.phone = kwargs.get('phone')

    def full_name(self):
        return "%s %s" % (self.first_name, self.last_name)
