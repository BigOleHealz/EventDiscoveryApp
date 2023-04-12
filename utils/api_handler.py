import os, json, traceback, re, requests, functools

from db import queries
from utils.logger import Logger

def handle_exceptions(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        self = args[0]
        try:
            return func(*args, **kwargs)
        except Exception as error:
            self.logger.emit(msg=error)
            self.logger.emit(msg=f"Traceback: {traceback.format_exc()}")
            raise ValueError(error)
    return wrapper

class ApiHandler:
    def __init__(self, logger: Logger):
        self.logger = logger
        self.base_url = os.environ['API_RESOURCE_PATH_AND_STAGE']
        self.headers = {'Content-Type': 'application/json'}
        self.session = requests.Session()
    
    @staticmethod
    def __cleanse_api_request_body(params: str):
        params_str = json.dumps(params)
        params_str = params_str.replace("\n", " ").replace("\r", " ").replace("\t", " ")
        params_str = params_str.replace("\\n", " ").replace("\\r", " ").replace("\\t", " ").strip()
        params_str = re.sub(' {2,}', ' ', params_str)
        
        return json.loads(params_str)

    def submit_api_request(self, request_type: str, endpoint: str, params: dict=None):
        try:
            if params is None:
                params =  {}
            url = f"{self.base_url}/{endpoint}"
            
            self.logger.emit(f"API request of type={request_type.upper()} submitted to {url} with params: {params}")
            params = self.__cleanse_api_request_body(params)
            
            if request_type.lower() == 'get':
                response = self.session.get(url, json=params, headers=self.headers)
            elif request_type.lower() == 'post':
                response = self.session.post(url, json=params, headers=self.headers)
            elif request_type.lower() == 'put':
                response = self.session.put(url, json=params, headers=self.headers)
            elif request_type.lower() == 'delete':
                response = self.session.delete(url, json=params, headers=self.headers)
            else:
                raise ValueError(f"Invalid request type: {request_type}")
            
            response.raise_for_status() # Raise exception for 4xx/5xx status codes
            
            if response.status_code != requests.codes.ok:
                self.logger.emit(f"API request to {url} failed with status code: {response.status_code}")
            
            response = json.loads(response.text)["body"]
            return response
        except requests.exceptions.HTTPError as error:
            self.logger.emit(f'HTTP error occurred: {error}')
            return None
        except requests.exceptions.Timeout as error:
            self.logger.emit(f'Request timed out: {error}')
            return None
        except requests.exceptions.RequestException as error:
            self.logger.emit(f'An error occurred while making request: {error}')
            return None

        except Exception as error:
            self.logger.emit(msg=error)
            self.logger.emit(msg=f"Traceback: {traceback.format_exc()}")
            raise ValueError(error)
    
    @handle_exceptions
    def get(self, endpoint: str, params: dict=None):
        return self.submit_api_request(request_type='get', endpoint=endpoint, params=params)
    
    @handle_exceptions
    def delete(self, endpoint: str, params: dict=None):
        return self.submit_api_request(request_type='delete', endpoint=endpoint, params=params)
    
    @handle_exceptions
    def post(self, endpoint: str, params: dict=None):
        return self.submit_api_request(request_type='post', endpoint=endpoint, params=params)
    
    @handle_exceptions
    def put(self, endpoint: str, params: dict=None):
        return self.submit_api_request(request_type='put', endpoint=endpoint, params=params)
    
    def get_event_type_mappings(self):
        try:
            response = self.submit_api_request(request_type='post', endpoint='execute_db_command', params={"query" : queries.GET_EVENT_TYPE_NAMES_MAPPINGS})
            print(f"response: {response}")
            response = {elem[0] : elem[1] for elem in response}
            
            # response = {int(key) : val for key, val in response.items()}
            return response
            
        except Exception as error:
            self.logger.emit(msg=error)
            self.logger.emit(msg=f"Traceback: {traceback.format_exc()}")
            raise ValueError(error)
        
    def get_person_friends(self, email: str):
        try:
            response = self.submit_api_request(request_type='post', endpoint='execute_db_command', params={"query" : queries.GET_PERSON_FRIENDS_ID_NAME_MAPPINGS_BY_EMAIL.format(email=email)})
            response = [{"_id" : elem[0], "FirstName" : elem[1], "LastName" : elem[2]} for elem in response]
            
            return response
        except Exception as error:
            self.logger.emit(msg=error)
            self.logger.emit(msg=f"Traceback: {traceback.format_exc()}")
            raise ValueError(error)
    
    def get_friend_request_list(self, email: str):
        try:
            response = self.submit_api_request(request_type='post', endpoint='execute_db_command', params={"query" : queries.GET_PENDING_FRIEND_REQUESTS.format(email=email)})
            # response = [{"_id" : elem[0], "FirstName" : elem[1], "LastName" : elem[2]} for elem in response]
            return response
        except Exception as error:
            self.logger.emit(msg=error)
            self.logger.emit(msg=f"Traceback: {traceback.format_exc()}")
            raise ValueError(error)
