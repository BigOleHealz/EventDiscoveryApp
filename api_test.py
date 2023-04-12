import requests, json, os, unittest

from db import queries

from db.db_handler import Neo4jDB
from utils.api_handler import ApiHandler
from utils.logger import Logger

class ApiTester(unittest.TestCase):
    def setUp(self):
        self.email = "matt@gmail.com"
        self.logger = Logger(__name__)
        self.base_url = os.environ["API_RESOURCE_PATH_AND_STAGE"]
        self.headers = {"Content-Type": "application/json"}
        self.session = requests.Session()
        self.api_handler = ApiHandler(logger=self.logger)
        self.neo4j_connector = Neo4jDB(logger=self.logger)
    
    def tearDown(self):
        self.session.close()
    
    def test_person_friends(self):
        query = queries.GET_PERSON_FRIENDS_ID_NAME_MAPPINGS_BY_EMAIL.format(email=self.email)
        person_friends_api = self.api_handler.post(
            endpoint="execute_db_command",
            params={"query": query},
        )
        person_friends_db = self.neo4j_connector.execute_query(
            query=query
        )
        self.assertEqual(person_friends_api, person_friends_db)
    
    def test_friend_request_list(self):
        query = queries.GET_PENDING_FRIEND_REQUESTS.format(email=self.email)
        friend_request_list_api = self.api_handler.post(
            endpoint="execute_db_command",
            params={"query": query},
        )
        friend_request_list_db = self.neo4j_connector.execute_query(
            query=query
        )
        self.assertEqual(friend_request_list_api, friend_request_list_db)
    
    # def test_pending_event_invites(self):
    #     query = queries.GET_PENDING_EVENT_INVITES.format(email=self.email)
    #     pending_event_invites_api = self.api_handler.post(
    #         endpoint="execute_db_command",
    #         params={"query": query},
    #     )
    #     pending_event_invites_db = self.neo4j_connector.execute_query(
    #         query=query
    #     )
    #     import pdb; pdb.set_trace()
        
    #     self.assertEqual(pending_event_invites_api, pending_event_invites_db)
        

# url = "https://o83fz5lh02.execute-api.us-east-1.amazonaws.com/test/get_node?email=matt@gmail.com"


# event_type_mappings = neo4j_connector.get_event_type_mappings()



# response = requests.get(url, data=json.dumps(data), headers=headers)
# response = requests.get(url, headers=headers)
# response = api_handler.submit_api_request(request_type="get", endpoint=f"get_node", data=f'{"email": "{email}"}')



# response = requests.get("https://o83fz5lh02.execute-api.us-east-1.amazonaws.com/test/get_node", params=params, headers=headers)

# event_type_mappings = api_handler.get_event_type_mappings()
# print(f"{event_type_mappings=}")


if __name__ == "__main__":
    unittest.main()
