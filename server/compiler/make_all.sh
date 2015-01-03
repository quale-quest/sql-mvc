#!/bin/bash
 
cd -P .
# The absolute path of the directory containing this script.
DIR="$( cd "$( dirname "$0" )" && pwd)"
# Where is the top level project directory relative to this script?
PROJECT_DIR="${DIR}/../.."
 
# Set up a list of directories to monitor.
MONITOR=()
MONITOR+=( "${PROJECT_DIR}/Quale" ) 
DELTA_FILE="/tmp/file-monitor-delta.txt"
FLOCK_FILE="/tmp/file-monitor-flock.txt"
 
 ( #lock and start subprocess
 flock -x -w 0.1 200 || exit 1 
 
rm -r output	
find ${MONITOR[*]} -type f -name Index.quicc > ${DELTA_FILE}

#give some feedback
cat ${DELTA_FILE} 	

#execute the compiler
node compile.js deltafile ${DELTA_FILE} 
    
  
) 200>${FLOCK_FILE}
 
