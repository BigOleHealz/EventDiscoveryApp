#! /bin/sh

flask_server_dir="flask_server"
db_dir="db"
utils_dir="utils"


# if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
kill -9 $(lsof -t -i:5001)
sudo kill -9 $(sudo lsof -t -i:5001)
# fi

# if lsof -Pi :19006 -sTCP:LISTEN -t >/dev/null ; then
kill -9 $(lsof -t -i:19006)
sudo kill -9 $(sudo lsof -t -i:19006)
# fi

#!/bin/bash

if ! docker info >/dev/null 2>&1; then
    echo "Starting Docker..."
    # Path might be different depending on the location of Docker app
    open /Applications/Docker.app
    # Wait until Docker daemon is running and has completed initialisation
    while (! docker info >/dev/null 2>&1 ); do
        # Docker takes a few seconds to initialize
        echo "Waiting for Docker to launch..."
        sleep 1
    done
fi

docker stop $(docker ps -q)
docker rm $(docker ps -a -q)
docker rmi $(docker images -a -q)


docker container prune -f
docker image prune -f
docker system prune -a -f

rm -rf $flask_server_dir/$db_dir
rm -rf $flask_server_dir/$utils_dir

cp -r $db_dir $flask_server_dir/
cp -r $utils_dir $flask_server_dir/

docker-compose up --build
