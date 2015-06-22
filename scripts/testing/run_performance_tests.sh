#!/bin/bash

set -e

ABSOLUTE_PATH=$(cd `dirname "${BASH_SOURCE[0]}"` && pwd)/`basename "${BASH_SOURCE[0]}"`

cd $(dirname "${ABSOLUTE_PATH}")/../../eums/client

grunt performance
cd scripts
ant
