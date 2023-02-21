from flask_login import UserMixin
from py2neo import Node

class Account(UserMixin, Node):
    def __init__(self, node: Node):
        super().__init__(UserMixin)
        # super().__init__(Node)
        self.node = node
    
    def __str__(self):
        return f'<Account Email: {self.Email} identity={self.identity}>'
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def Email(self):
        return self.node['Email']
    
    @property
    def Name(self):
        if 'Person' in self.node._labels:
            return f"{self.node['FirstName']} {self.node['LastName']}"
        elif 'Business' in self.node._labels:
            return self.node['Title']
        else:
            raise TypeError(f"Account node does not have either label 'Person' or 'Business'")
        
    
    def is_active(self):
        return True
    
    def is_anonymous(self):
        return False
    
    @property
    def identity(self):
        return self.node.identity
    
    def get_id(self):
        return self.identity
