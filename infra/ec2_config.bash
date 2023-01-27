#! /usr/bin/bash

sudo yum update

sudo yum install git
mkdir workspace
cd workspace
git clone git@github.com:BigOleHealz/EventApp.git

cd EventApp
git checkout Develop_1.1


sudo amazon-linux-extras install epel
sudo yum install xrdp
sudo systemctl start xrdp

## https://aws.amazon.com/premiumsupport/knowledge-center/ec2-linux-2-install-gui/
sudo amazon-linux-extras install mate-desktop1.x
sudo bash -c 'echo PREFERRED=/usr/bin/mate-session > /etc/sysconfig/desktop'
sudo yum install tigervnc-server

## Set password When asked if you want to enter a view-only password, press "n"
vncpasswd

sudo mkdir /etc/tigervnc
sudo bash -c 'echo localhost > /etc/tigervnc/vncserver-config-mandatory'
sudo cp /lib/systemd/system/vncserver@.service /etc/systemd/system/vncserver@.service
sudo sed -i 's/<USER>/ec2-user/' /etc/systemd/system/vncserver@.service
sudo systemctl daemon-reload
sudo systemctl enable vncserver@:1
sudo systemctl start vncserver@:1

## install browser




