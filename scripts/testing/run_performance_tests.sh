#!/bin/bash

set -e

cd eums/client

grunt performance
cd scripts
ant

