#!/bin/bash

#Obviously update with variables. its simple but teadious... but worth it

rm -rf /opt/dependencies
mkdir -p /opt/dependencies/python

pip3 install -r scripts/requirements.txt --target /opt/dependencies/python
mkdir /opt/dependencies/python/utils
mkdir /opt/dependencies/python/db

cp $EVENT_APP_HOME/db/db_handler.py /opt/dependencies/python/db/
cp $EVENT_APP_HOME/db/queries.py /opt/dependencies/python/db/
cp $EVENT_APP_HOME/db/__init__.py /opt/dependencies/python/db/

cp $EVENT_APP_HOME/utils/aws_handler.py /opt/dependencies/python/utils/
cp $EVENT_APP_HOME/utils/constants.py /opt/dependencies/python/utils/
cp $EVENT_APP_HOME/utils/logger.py /opt/dependencies/python/utils/
cp $EVENT_APP_HOME/utils/helper_functions.py /opt/dependencies/python/utils/
cp $EVENT_APP_HOME/utils/__init__.py /opt/dependencies/python/utils/


# rm -rf /opt/python
# mkdir /opt/python
# cp -r /opt/dependencies/python/* /opt/python/

cd /opt/dependencies
zip -r ../layer.zip python

aws lambda publish-layer-version --layer-name dependencies --zip-file fileb://../layer.zip --compatible-runtimes python3.8 --region us-east-1 --description "My layer"


latest_layer_arn=$(aws lambda publish-layer-version --layer-name dependencies --zip-file fileb://../layer.zip --compatible-runtimes python3.8 --region us-east-1 --query LayerVersionArn --output text)



aws lambda publish-version --function-name stonks-lambdas-GetEventsFunction > /dev/null
aws lambda update-function-configuration --function-name stonks-lambdas-GetEventsFunction --layers $latest_layer_arn --region us-east-1  >> /dev/null

# aws lambda get-function-configuration --function-name stonks-lambdas-GetEventsFunction --region us-east-1  >> /dev/null
# sed -i "s/arn:aws:lambda:us-east-1:620803767360:layer:dependencies:[0-9]*/$latest_layer_arn/g" $EVENT_APP_HOME/infra/stonks_lambdas/get_node/template.yaml
# sed -i "s/arn:aws:lambda:us-east-1:620803767360:layer:dependencies:[0-9]*/$latest_layer_arn/g" $EVENT_APP_HOME/infra/stonks_lambdas/get_events/template.yaml

