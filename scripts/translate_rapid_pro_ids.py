from eums.models import Question, Flow

file_sections = {"QUESTIONS": 1, "FLOWS": 2}


def run():
    currently_reading = None
    file_location = './rapid-pro-id-translation-file.txt'

    line_to_section_map = {'-- Questions --': file_sections['QUESTIONS'], '-- Flows --': file_sections['FLOWS'],
                           '-- End Questions --': None, '-- End Flows --': None}

    for line in open(file_location):
        if not line.startswith('#'):
            line = line.strip()
            currently_reading = line_to_section_map.get(line, currently_reading)

            if len(line.split(':')) == 2:
                replace_ids(currently_reading, line)


def replace_ids(currently_reading, line):
    if currently_reading is file_sections['QUESTIONS']:
        old_id, new_id = get_ids_from(line)
        replace_uuid(old_id, new_id)

    elif currently_reading is file_sections['FLOWS']:
        old_id, new_id = get_ids_from(line)
        replace_flow_id(old_id, new_id)


def get_ids_from(line):
    line_parts = line.split(':')
    old_id = line_parts[0].strip()
    new_id = line_parts[1].strip()
    return old_id, new_id


def replace_uuid(old_id, new_id):
    for question in Question.objects.filter(uuids__contains=[old_id]):
        for index, uuid in enumerate(question.uuids):
            if uuid == old_id:
                question.uuids[index] = new_id
        question.save()


def replace_flow_id(old_id, new_id):
    flow = Flow.objects.filter(rapid_pro_id=old_id).first()
    if flow:
        flow.rapid_pro_id = new_id
        flow.save()


