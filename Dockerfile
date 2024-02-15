FROM neo4j:latest

# ENTRYPOINT ["/usr/bin/tini", "-s"]

EXPOSE 7474 7687

# CMD ["cd", "/var/lib/neo4j/bin"]
 #, "&&", "neo4j", "start"]
