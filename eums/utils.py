def snakify(text):
    split_text = text.split()
    lowered = map(lambda word: word.lower(), split_text)
    return "_".join(lowered)


def get_lists_intersection(source_list):
    return reduce(lambda x, y: list(set(x) & set(y)), source_list)


def filter_relevant_value(mapping_template, data_dict):
    result = {}
    for key, value in data_dict.iteritems():
        if key in mapping_template.iterkeys():
            result[mapping_template[key]] = value
    return result


def all_relevant_data_contained(data_dict, checklist):
    for value in checklist:
        if value not in data_dict:
            return False
    return True


def get_index_of_particular_element_in_complex_list(data_list, filter_dict):
    for index, data in enumerate(data_list):
        found = True
        for key, value in filter_dict.iteritems():
            if not (data.get(key) and data.get(key) == value):
                found = False
                break

        if found:
            return index

    return -1
