import json
import sys
import unittest
from datetime import timedelta, datetime as dt
sys.path.append('/app')

from server import create_server
import message_strings as strings
from utils import constants

class BaseUnitTest(unittest.TestCase):
    def setUp(self):
        app = create_server()
        app.config['TESTING'] = True
        self.client = app.test_client()
    
class TestGetUserProfile(BaseUnitTest):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


    def test_get_user_profile_success(self):
        response = self.client.post('/get_user_profile', json={strings.email: "matt.t.healy1994@gmail.com"})
        self.assertEqual(response.status_code, 200)

        response_data = json.loads(response.data.decode())
        self.assertIn(strings.email, response_data.keys())
        self.assertIn(strings.first_name, response_data.keys())
        self.assertIn(strings.last_name, response_data.keys())
        self.assertIn(strings.uuid, response_data.keys())
        self.assertIn(strings.username, response_data.keys())
        self.assertIn(strings.interests, response_data.keys())

        self.assertEqual("Matt", response_data[strings.first_name])
        self.assertEqual("Healy", response_data[strings.last_name])

        self.assertIsInstance(response_data[strings.uuid], str)
        self.assertIsInstance(response_data[strings.username], str)
        self.assertIsInstance(response_data[strings.interests], list)


    def test_get_user_profile_no_body(self):
        response = self.client.post('/get_user_profile', json={})
        self.assertEqual(response.status_code, 400)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data['message'], strings.no_input_body_provided)
    
    def test_get_user_profile_no_email(self):
        response = self.client.post('/get_user_profile', json={"yo": "yo"})
        self.assertEqual(response.status_code, 400)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data['message'], strings.missing_email)
    
    def test_get_user_profile_invalid_email(self):
        response = self.client.post('/get_user_profile', json={strings.email: "agsdfgsdxfgsfdbdfg"})
        self.assertEqual(response.status_code, 200)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data, [])

class TestGetEventTypeMappings(BaseUnitTest):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def test_get_event_type_mappings_success(self):
        response = self.client.get('/get_event_type_mappings')
        self.assertEqual(response.status_code, 200)

        response_data = json.loads(response.data.decode())
        self.assertIsInstance(response_data, list)

        for mapping in response_data:
            self.assertIn(strings.event_type, mapping.keys())
            self.assertIn(strings.pin_color, mapping.keys())
            self.assertIn(strings.uuid, mapping.keys())
            self.assertIsInstance(mapping[strings.event_type], str)
            self.assertIsInstance(mapping[strings.pin_color], str)
            self.assertIsInstance(mapping[strings.uuid], str)

class TestIsUsernameTaken(BaseUnitTest):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def test_is_username_taken_true_success(self):
        response = self.client.post('/is_username_taken', json={strings.username: "yaboi"})
        self.assertEqual(response.status_code, 200)

        response_data = json.loads(response.data.decode())
        self.assertIn(strings.username_exists, response_data.keys())
        self.assertEqual(response_data[strings.username_exists], True)

    def test_is_username_taken_false_success(self):
        response = self.client.post('/is_username_taken', json={strings.username: "agsdfgsdxfgsfdbdfg"})
        self.assertEqual(response.status_code, 200)
        
        response_data = json.loads(response.data.decode())
        self.assertIn(strings.username_exists, response_data.keys())
        self.assertEqual(response_data[strings.username_exists], False)
    
    def test_is_username_taken_no_body(self):
        response = self.client.post('/is_username_taken', json={})
        self.assertEqual(response.status_code, 400)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data['message'], strings.no_input_body_provided)
    
    def test_is_username_taken_no_username(self):
        response = self.client.post('/is_username_taken', json={"yo": "yo"})
        self.assertEqual(response.status_code, 400)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data['message'], strings.missing_username)

class TestGetEvents(BaseUnitTest):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def test_get_events_success(self):
        response = self.client.post('/fetch_events',
                                    json={
                                        strings.start_timestamp: dt.now().strftime(constants.datetime_format),
                                        strings.end_timestamp: dt.now() + timedelta(hours=3)
                                        }
                                    )
        # if response.status_code != 200:
            # print(response.data.decode()['message'])
        self.assertEqual(response.status_code, 200)
        
        response_data = json.loads(response.data.decode())
        self.assertIsInstance(response_data, list)
        for event in response_data:
            self.assertIn(strings.address, event.keys())
            self.assertIn(strings.end_timestamp, event.keys())
            self.assertIn(strings.event_name, event.keys())
            self.assertIn(strings.event_type, event.keys())
            self.assertIn(strings.lat, event.keys())
            self.assertIn(strings.lon, event.keys())
            self.assertIn(strings.price, event.keys())
            self.assertIn(strings.start_timestamp, event.keys())
            self.assertIn(strings.uuid, event.keys())
            self.assertIsInstance(event[strings.address], str)
            self.assertIsInstance(event[strings.end_timestamp], str)
            self.assertIsInstance(event[strings.event_name], str)
            self.assertIsInstance(event[strings.event_type], str)
            self.assertIsInstance(event[strings.lat], float)
            self.assertIsInstance(event[strings.lon], float)
            self.assertIsInstance(event[strings.start_timestamp], str)
            self.assertIsInstance(event[strings.uuid], str)
    
    def test_get_events_no_body(self):
        response = self.client.post('/fetch_events', json={})
        self.assertEqual(response.status_code, 400)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data['message'], strings.no_input_body_provided)
    
    def test_get_events_no_start_timestamp(self):
        response = self.client.post('/fetch_events', json={strings.end_timestamp: dt.now() + timedelta(hours=3)})
        self.assertEqual(response.status_code, 400)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data['message'], strings.missing_start_timestamp)
    
    def test_get_events_no_end_timestamp(self):
        response = self.client.post('/fetch_events', json={strings.start_timestamp: dt.now().strftime(constants.datetime_format)})
        self.assertEqual(response.status_code, 400)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data['message'], strings.missing_end_timestamp)

class TestCreatePersonNode(BaseUnitTest):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def test_create_person_node_success(self):
        event_type_mappings = self.client.get('/get_event_type_mappings')
        self.assertEqual(event_type_mappings.status_code, 200)
        
        event_type_uuids = [event_type[strings.uuid] for event_type in json.loads(event_type_mappings.data.decode())]
        
        create_person_response = self.client.post('/create_person_node',
                                    json={
                                        strings.username: "1",
                                        strings.email: "1",
                                        strings.first_name: "1",
                                        strings.last_name: "1",
                                        strings.interest_uuids: event_type_uuids
                                    })
        if create_person_response.status_code != 200:
            print(create_person_response.data.decode())
        self.assertEqual(create_person_response.status_code, 200)
        create_person_response_data = json.loads(create_person_response.data.decode())
        self.assertIn(strings.uuid, create_person_response_data.keys())
        
        delete_person_response = self.client.post('/delete_node',
                                    json={
                                        strings.uuid: create_person_response_data[strings.uuid]
                                    })
        delete_person_response_data = json.loads(delete_person_response.data.decode())
        self.assetEqual(delete_person_response_data['message'], strings.delete_node_success)
        
        delete_person_second_response = self.client.post('/delete_node',
                                    json={
                                        strings.uuid: create_person_response_data[strings.uuid]
                                    })
        delete_person_second_response_data = json.loads(delete_person_second_response.data.decode())
        self.assetEqual(delete_person_second_response_data['message'], strings.delete_node_not_found)
        

if __name__ == '__main__':
    unittest.main()
