from flask_login import UserMixin
from py2neo import Node

class Account(UserMixin, Node):
    def __init__(self, node: Node):
        super().__init__(node)
        self.__node = node
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def Email(self):
        return self.__node['Email']
    
    def is_active(self):
        return True
    
    def is_anonymous(self):
        return False
    
    def get_id(self):
        return self.identity
