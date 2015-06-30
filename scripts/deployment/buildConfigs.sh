#!/bin/bash

# Make sure we have the right IPs for the contacts service
cd /opt/app/eums/eums/client
echo $1
grunt build-staging:$1
grunt build-staging:$1
