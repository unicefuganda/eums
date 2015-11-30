
def snakify(text):
    split_text = text.split()
    lowered = map(lambda word: word.lower(), split_text)
    return "_".join(lowered)


def get_lists_intersection(source_list):
    return reduce(lambda x, y: list(set(x) & set(y)), source_list)
