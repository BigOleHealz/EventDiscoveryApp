ssh -i "Neo4j_key.pem" ec2-user@100.26.167.168

sudo service neo4j start

sudo ufw allow from 172.31.61.153 to any port 7687 proto tcp

sudo mv /var/lib/neo4j/labs/apoc-*-core.jar /var/lib/neo4j/plugins/ && sudo systemctl restart neo4j