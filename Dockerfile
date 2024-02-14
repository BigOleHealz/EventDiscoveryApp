FROM neo4j:latest

ENTRYPOINT ["/usr/bin/tini", "--"]

EXPOSE 7474 7687

CMD ["/var/lib/neo4j/bin/neo4j", "start"]
