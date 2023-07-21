
#!/bin/bash

# agovind, a year ago
set -x
set -e
# appName="file_uploader"
source /app/env.sh
# http proxy settings for this script . /etc/pipeline/profile
#install from package managers
yum update -y
yum install -y python37 git docker
systemctl enable docker
service docker start
usermod -a -G docker ec2-user

# Grab the Docker container that will be used
CONTAINER_NAME=`cat /tmp/manifest.mf`
# setup the docker container
kms_decrypt `cat /tmp/af_key.enc` | docker login --username srvc_mamcli_arti_rel artifactory.devtools.syd.c1.macquarie.com:9978 --password-stdin
docker pull $CONTAINER_NAME

sed 's/\"//g' /etc/pipeline/profile.d/env.profile.sh > /app/env.profile.sh

# Configure the container to run as a service
pushd /usr/lib/systemd/system/
[ -s ./$appName.service ] && rm -f $appName.service
cat << eof >> $appName.service
[Unit]
Description=AFR Data Pipeline

[Service]
Type-simple
Restart-on-failure
ExecStartPre--/usr/bin/docker rm -f $appName
ExecStart=/usr/bin/docker run -p 8080:8080 --env-file /app/env.sh \
                                            --env-file /app/env.profile.sh \
                                            --env HTTP_PROXY=$HTTP_PROXY \
                                            --env HTTPS_PROXY=$HTTPS_PROXY \
                                            --env NO_PROXY=$NO_PROXY \
                                            --name $appName $CONTAINER_NAME 




ExecStop=/usr/bin/docker stop $appName
[Install]
WantedBy-multi-user.target



eof
popd
# load files into systemd
systemctl daemon-reload
# start docker
systemctl enable docker
systemctl start docker
systemctl status docker
# start the container
systemctl enable $appName.service
systemctl start $appName.service
systemctl status $appName.service
