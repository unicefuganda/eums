#!/bin/bash

#push the image install script and fig.yml and image to the target box
scp -t -t -i ${KEY_LOCATION} ${USER}@${HOST_IP} << EOF
#push the deployment script to the target box
scp -t -t -i ${KEY_LOCATION} ${USER}@${HOST_IP} << EOF
#run the deployment script via ssh on the server
ssh -t -t -i ${KEY_LOCATION} ${USER}@${HOST_IP} << EOF

