from bs4 import BeautifulSoup
import json
import os

def find_json(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    scripts = soup.find_all('script')
    json_objects = []
    
    for script in scripts:
        script_content = script.string
        if script_content and script_content.strip().startswith('{') and script_content.strip().endswith('}'):
            try:
                json_object = json.loads(script_content)
                json_objects.append(json_object)
            except json.JSONDecodeError:
                print(f'Failed to parse JSON from script tag in {file_path}')

    return json_objects

file_path = os.path.join(os.getcwd(), "homepages", "2023-06-21_philadelphia.html")  # replace with your actual file path
json_objects = find_json(file_path)

event_data_dict = None

required_keys = ["startDate", "endDate", "name", "description", "location", "@type"]

for json_object in json_objects:
    if all(key in json_object for key in required_keys):
        event_data_dict = json_object
        break

if event_data_dict is not None:
    print("Found a JSON object with all the required keys:", event_data_dict)
else:
    print("Did not find a JSON object with all the required keys")

