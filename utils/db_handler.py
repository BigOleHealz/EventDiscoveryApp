from neo4j import GraphDatabase

class Neo4jDB:
    def __init__(self):
        # Connection string for the Neo4j database
        self.cxn_string = "bolt://ec2-100-26-167-168.compute-1.amazonaws.com:7687"

        # Create a driver instance
        self.driver = GraphDatabase.driver(self.cxn_string, auth=("neo4j", "Baller01$n"))

    
    def run_query(self, query: str):
        # Use the driver to create a session
        with self.driver.session() as session:
            # Execute a Cypher query to return all nodes in the database
            result = session.run(query)
            # Print the results
            records = [record for record in result]
        
        import pdb; pdb.set_trace()
        
        print(records)
        return records

if __name__ == '__main__':
    neo4j = Neo4jDB()
    results = neo4j.run_query(query="MATCH (n) RETURN n LIMIT 100")

# "MATCH (n) RETURN n LIMIT 100"