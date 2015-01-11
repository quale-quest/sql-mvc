#!/bin/bash
 

# The absolute path of the directory containing this script.
DIR="$( cd "$( dirname "$0" )" && pwd -P)"
# Where is the top level project directory relative to this script?

PROJECT_DIR="${DIR}/../.."

#signal rebuild to restart and call the compiler's monitor
rm  $PROJECT_DIR/built_complete  2> /dev/null
bash check.sh
