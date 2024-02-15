#! /bin/bash

docker stop neo4j-cont
docker rm neo4j-cont
docker rmi neo4j

docker build -t neo4j .
docker run -d --name neo4j-cont -p 7474:7474 -p 7687:7687 neo4j
docker logs neo4j-cont
