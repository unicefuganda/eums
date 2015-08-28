
def snakify(text):
    split_text = text.split()
    lowered = map(lambda word: word.lower(), split_text)
    return "_".join(lowered)