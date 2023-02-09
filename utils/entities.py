from flask_login import UserMixin
from py2neo import Node

class Account(UserMixin, Node):
    def __init__(self, node: Node):
        super().__init__(UserMixin)
        self.node = node
    
    def __str__(self):
        return f'<Account Email: {self.Email} identity={self.identity}>'
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def Email(self):
        return self.node['Email']
    
    def is_active(self):
        return True
    
    def is_anonymous(self):
        return False
    
    @property
    def identity(self):
        return self.node.identity
    
    def get_id(self):
        return self.identity
