#!/bin/bash

sudo mv /var/lib/neo4j/labs/apoc-*-core.jar /var/lib/neo4j/plugins/ && sudo systemctl restart neo4j

CREATE CONSTRAINT unique_email FOR (account:Account) REQUIRE account.Email IS UNIQUE;
