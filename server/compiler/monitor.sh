#!/bin/bash
loops on check.sh
#

# The interval in seconds between each check on monitored files.
INTERVAL_SECONDS=1

DIR="$( cd "$( dirname "$0" )" && pwd)"
pushd ${DIR}

while [[ true ]] ; do
  bash ./check.sh
  sleep ${INTERVAL_SECONDS}
done

#eof