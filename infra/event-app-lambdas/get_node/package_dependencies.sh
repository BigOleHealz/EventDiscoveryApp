#!/bin/bash


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



# latest_layer_arn=$(aws lambda list-layer-versions --layer-name dependencies --query 'LayerVersions[0].LayerVersionArn' --output text --region us-east-1)

aws lambda update-function-configuration --function-name event-app-lambdas-GetNodeFunction-EyeHVMI9bMdq --layers $latest_layer_arn --region us-east-1

aws lambda get-function-configuration --function-name event-app-lambdas-GetNodeFunction-EyeHVMI9bMdq --region us-east-1

# sed -i.bak "s/LAYER_ARN_PLACEHOLDER/${latest_layer_arn}/g" updated-template.yaml && \
# rm template.yaml.bak
