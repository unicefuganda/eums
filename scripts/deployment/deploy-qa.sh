#!/bin/bash

#push the image install script and fig.yml and image to the target box
scp -t -t -i ${DEP LOY_MACHINE_KEY_LOCATION} ${DEPLOY_USER}@${DEPLOY_HOST} << EOF
#push the deployment script to the target box
scp -t -t -i ${DEP LOY_MACHINE_KEY_LOCATION} ${DEPLOY_USER}@${DEPLOY_HOST} << EOF
#run the deployment script via ssh on the server
scp -t -t -i ${DEP LOY_MACHINE_KEY_LOCATION} ${DEPLOY_USER}@${DEPLOY_HOST} << EOF

