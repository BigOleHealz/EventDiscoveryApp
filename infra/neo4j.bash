ssh -i "Neo4j_key.pem" ec2-user@100.26.167.168

sudo service neo4j start

sudo ufw allow from 172.31.61.153 to any port 7687 proto tcp
