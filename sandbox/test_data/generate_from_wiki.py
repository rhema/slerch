import json


in_file = "wikimoney.json"

deser = json.load(open(in_file))

to_json = []

for k in deser['wikipedia_page']['sections']['section']:
    for para in k['paragraphs']:
        p = k['paragraphs'][para]
        if len(p) > 0:
            if 'text' in p[0]:
                print p[0]['text']
                to_json += [p[0]['text']]
print 'var wiki_text =',json.dumps(to_json)+";"