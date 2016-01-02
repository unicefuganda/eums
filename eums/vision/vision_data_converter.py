import datetime
import re


def convert_vision_value(key, value):
    if type(value) == unicode:
        try:
            encoded_value = value.encode('ascii', 'ignore')
            return int(encoded_value)
        except ValueError:
            return value

    if type(value) == str:
        matched_date = re.match(r'/Date\((\d+)\)/', value, re.I)
        if matched_date:
            return datetime.datetime.fromtimestamp(int(matched_date.group(1)) / 1000.0)

    if key == 'WBS_REFERENCE' and value:
        return re.sub(r'(.{4})(.{2})(.{2})', r'\1/\2/\3/', value[0:11])

    return value
