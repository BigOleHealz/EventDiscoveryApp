FROM neo4j:latest

ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 7474 7687

CMD ["neo4j"]
