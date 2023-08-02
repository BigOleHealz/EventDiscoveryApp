#! /usr/bin/bash

sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -aG docker ec2-user

wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
sudo ./sam-installation/install



sudo yum install git
mkdir workspace
cd workspace
git clone git@github.com:BigOleHealz/Stonks.git

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

alias venv='source $EVENT_APP_HOME/myvenv/bin/activate'
alias cdm='cd $EVENT_APP_HOME'
alias kp3="pkill -f 'python3*' & pkill -f '/usr/bin/python3*'"


sudo yum install unzip -y
cd /tmp
wget https://chromedriver.storage.googleapis.com/{VERSION}/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
sudo mv chromedriver /usr/bin/chromedriver
sudo chmod +x /usr/bin/chromedriver
wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
sudo yum install -y ./google-chrome-stable_current_*.rpm

# sudo yum install -y httpd
# sudo systemctl start httpd && sudo systemctl enable httpd
# sudo usermod -a -G apache ec2-user
# sudo chown -R ec2-user:apache /var/www
# sudo chmod 2775 /var/www && find /var/www -type d -exec sudo chmod 2775 {} \;
# find /var/www -type f -exec sudo chmod 0664 {} \;
# sudo yum install -y mod_ssl

# cd /etc/pki/tls/certs
# sudo ./make-dummy-cert localhost.crt
# sudo sed -i '/^SSLCertificateKeyFile/ s/^/#/' /etc/httpd/conf.d/ssl.conf
# sudo systemctl restart httpd

sudo amazon-linux-extras install nginx1.12

sudo yum groupinstall "Development Tools" -y
sudo yum remove nodejs npm -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
. ~/.nvm/nvm.sh
npm install -g create-react-app
npm install -g expo-cli
