#!/bin/bash

set -x
set -e
# appName="my-dev-container"
# http proxy settings for this script . /etc/pipeline/profile
#install from package managers
usermod -a -G docker ec2-user
systemctl enable docker
# service docker start


# ExecStartPre=/usr/bin/docker build -t https_service /home/ec2-user/workspace/EventApp/app_frontend/
# ExecStartPre=/usr/bin/docker rm -f $appName

# Configure the container to run as a service
pushd /usr/lib/systemd/system/
[ -s ./my-dev-container.service ] && rm -f my-dev-container.service
cat << eof >> my-dev-container.service
[Unit]
Description=Stonks App UI

[Service]
Type=simple
Restart=on-failure
ExecStart=/usr/bin/docker run -v /home/ec2-user/workspace/EventApp/app_frontend:/app -d -p 19006:19006 --name my-dev-container https_service
ExecStop=/usr/bin/docker stop my-dev-container

[Install]
WantedBy=multi-user.target

eof
popd
# load files into systemd
sudo systemctl daemon-reload
# start docker
sudo systemctl start docker
sudo systemctl status docker
# start the container
sudo systemctl enable my-dev-container.service
sudo systemctl start my-dev-container.service
sudo systemctl status my-dev-container.service
