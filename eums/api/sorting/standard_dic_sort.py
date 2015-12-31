SORT_BY = 'field'
ORDER = 'order'


class StandardDicSort(object):
    def __init__(self, *sort_field):
        self.sort_field = sort_field
        super(StandardDicSort, self).__init__()

    def sort_by(self, request, to_be_sorted):
        sort_key = request.GET.get(SORT_BY)
        if sort_key in self.sort_field:
            return sorted(to_be_sorted, key=lambda d: d.get(sort_key), reverse=request.GET.get(ORDER) == 'desc')
        return to_be_sorted
