#!/bin/bash

#Obviously update with variables. its simple but teadious... but worth it

rm -rf /opt/dependencies
mkdir -p /opt/dependencies/python

pip3 install -r scripts/requirements.txt --target /opt/dependencies/python

rm -rf /opt/python
mkdir /opt/python
cp -r /opt/dependencies/python/* /opt/python/*

cd /opt/dependencies
zip -r ../layer.zip .

aws lambda publish-layer-version --layer-name dependencies --zip-file fileb://../layer.zip --compatible-runtimes python3.8 --region us-east-1 --description "My layer"


latest_layer_arn=$(aws lambda publish-layer-version --layer-name dependencies --zip-file fileb://../layer.zip --query LayerVersionArn --output text)



aws lambda publish-version --function-name aws lambda publish-version --function-name stonks-lambdas-GetNodeFunction-lmWHMW3mnRdZ
aws lambda update-function-configuration --function-name stonks-lambdas-GetNodeFunction-lmWHMW3mnRdZ --layers $latest_layer_arn --region us-east-1

aws lambda get-function-configuration --function-name stonks-lambdas-GetNodeFunction-lmWHMW3mnRdZ --region us-east-1
