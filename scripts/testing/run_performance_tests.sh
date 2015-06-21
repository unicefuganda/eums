#!/bin/bash

set -e

MYDIR="$(dirname "$(which "$0")")"

cd ${MYDIR}/../../eums/client

grunt performance
cd scripts
ant

