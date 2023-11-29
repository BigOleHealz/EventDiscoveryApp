import json
import sys
import unittest
sys.path.append('/app')

from server import create_server

class TestGetUserProfile(unittest.TestCase):
    def setUp(self):
        app = create_server()
        app.config['TESTING'] = True
        self.client = app.test_client()


    def test_get_user_profile_success(self):
        response = self.client.post('/get_user_profile', json={"email": "matt.t.healy1994@gmail.com"})
        self.assertEqual(response.status_code, 200)

        response_data = json.loads(response.data.decode())
        self.assertIn("Email", response_data.keys())
        self.assertIn("FirstName", response_data.keys())
        self.assertIn("LastName", response_data.keys())
        self.assertIn("UUID", response_data.keys())
        self.assertIn("Username", response_data.keys())
        self.assertIn("Interests", response_data.keys())

        self.assertEqual("Matt", response_data["FirstName"])
        self.assertEqual("Healy", response_data["LastName"])

        self.assertIsInstance(response_data["UUID"], str)
        self.assertIsInstance(response_data["Username"], str)
        self.assertIsInstance(response_data["Interests"], list)


    def test_get_user_profile_no_body(self):
        response = self.client.post('/get_user_profile', json={})
        self.assertEqual(response.status_code, 400)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data['message'], "No input body provided")
    
    def test_get_user_profile_no_email(self):
        response = self.client.post('/get_user_profile', json={"yo": "yo"})
        self.assertEqual(response.status_code, 400)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data['message'], "Missing email")
    
    def test_get_user_profile_invalid_email(self):
        response = self.client.post('/get_user_profile', json={"email": "agsdfgsdxfgsfdbdfg"})
        self.assertEqual(response.status_code, 200)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data, [])

class TestGetEventTypeMappings(unittest.TestCase):
    def setUp(self):
        app = create_server()
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_get_event_type_mappings_success(self):
        response = self.client.get('/get_event_type_mappings')
        self.assertEqual(response.status_code, 200)

        response_data = json.loads(response.data.decode())
        self.assertIsInstance(response_data, list)

        for mapping in response_data:
            self.assertIn("EventType", mapping.keys())
            self.assertIn("PinColor", mapping.keys())
            self.assertIn("UUID", mapping.keys())
            self.assertIsInstance(mapping["EventType"], str)
            self.assertIsInstance(mapping["PinColor"], str)
            self.assertIsInstance(mapping["UUID"], str)

class TestIsUsernameTaken(unittest.TestCase):
    def setUp(self):
        app = create_server()
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_is_username_taken_true_success(self):
        response = self.client.post('/is_username_taken', json={"username": "yaboi"})
        self.assertEqual(response.status_code, 200)

        response_data = json.loads(response.data.decode())
        self.assertIn("usernameExists", response_data.keys())
        self.assertEqual(response_data['usernameExists'], True)

    def test_is_username_taken_false_success(self):
        response = self.client.post('/is_username_taken', json={"username": "agsdfgsdxfgsfdbdfg"})
        self.assertEqual(response.status_code, 200)
        
        response_data = json.loads(response.data.decode())
        self.assertIn("usernameExists", response_data.keys())
        self.assertEqual(response_data['usernameExists'], False)
    
    def test_is_username_taken_no_body(self):
        response = self.client.post('/is_username_taken', json={})
        self.assertEqual(response.status_code, 400)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data['message'], "No input body provided")
    
    def test_is_username_taken_no_username(self):
        response = self.client.post('/is_username_taken', json={"yo": "yo"})
        self.assertEqual(response.status_code, 400)

        response_data = json.loads(response.data.decode())
        self.assertEqual(response_data['message'], "Missing username")

        
if __name__ == '__main__':
    unittest.main()
