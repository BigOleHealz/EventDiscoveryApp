#!/bin/bash



docker rm -f my-dev-container
docker run -it --env-file .env -p 19006:19006 -v $(pwd):/app -w /app --name my-dev-container 620803767360.dkr.ecr.us-east-1.amazonaws.com/stonks_containers:latest /bin/bash