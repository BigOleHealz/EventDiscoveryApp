#! /usr/bin/bash

sudo yum update

sudo yum install git
mkdir workspace
cd workspace
git clone git@github.com:BigOleHealz/EventApp.git

cd EventApp
git checkout Develop_1.1


# sudo amazon-linux-extras install epel
# sudo yum install xrdp
# sudo systemctl start xrdp

## https://aws.amazon.com/premiumsupport/knowledge-center/ec2-linux-2-install-gui/
# sudo amazon-linux-extras install mate-desktop1.x
# sudo bash -c 'echo PREFERRED=/usr/bin/mate-session > /etc/sysconfig/desktop'
# sudo yum install tigervnc-server

# ## Set password When asked if you want to enter a view-only password, press "n"
# vncpasswd

# sudo mkdir /etc/tigervnc
# sudo bash -c 'echo localhost > /etc/tigervnc/vncserver-config-mandatory'
# sudo cp /lib/systemd/system/vncserver@.service /etc/systemd/system/vncserver@.service
# sudo sed -i 's/<USER>/ec2-user/' /etc/systemd/system/vncserver@.service
# sudo systemctl daemon-reload
# sudo systemctl enable vncserver@:1
# sudo systemctl start vncserver@:1

## install browser


# https://neo4j.com/developer/neo4j-cloud-aws-ec2-ami/
export GROUP="neo4j-sg"
aws ec2 create-security-group \
  --group-name $GROUP \
  --description "Neo4j security group"

for port in 22 7474 7473 7687; do
  aws ec2 authorize-security-group-ingress --group-name $GROUP --protocol tcp --port $port --cidr 0.0.0.0/0
done

aws ec2 describe-images \
   --region us-east-1 \
   --owner 385155106615 \
   --query "Images[*].{ImageId:ImageId,Name:Name}"


# Install agent for Secure Session Manager
sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm

# install python3.8
sudo amazon-linux-extras install python3.8
