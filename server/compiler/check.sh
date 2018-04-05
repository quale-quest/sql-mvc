#!/bin/bash
#Modified method of  https://www.exratione.com/2014/09/nodejs-is-too-inefficient-to-monitor-files-so-use-bash-scripts-instead/
#


 
# The absolute path of the directory containing this script.
DIR="$( cd "$( dirname "$0" )" && pwd -P)"

# Where is the top level project directory relative to wd?
COMPILER_DIR="$( cd "${DIR}/../../server/compiler" && pwd -P)"
PROJECT_DIR="$( pwd -P)"




#echo PROJECT_DIR : $PROJECT_DIR
#echo COMPILER_DIR : $COMPILER_DIR


# Set up a list of directories to monitor.
MONITOR=()
MONITOR+=( "${PROJECT_DIR}/Quale" )
#MONITOR+=( "${PROJECT_DIR}/js" )
#MONITOR+=( "${PROJECT_DIR}/template" )
 
# This file will be used as a timestamp reference point.
TIMESTAMP_FILE="/tmp/file-monitor-ts"
DELTA_FILE="/tmp/file-monitor-delta.txt"
FLOCK_FILE="/tmp/file-monitor-flock.txt"
 
# The interval in seconds between each check on monitored files.
INTERVAL_SECONDS=1



( #lock and start subprocess
flock -x -w 0.1 200 || exit 1 

if [ -f "$PROJECT_DIR/output/built_complete" ]; then

# Give some user feedback 
 #echo Monitoring ${MONITOR[*]}
 
 #create reference file if needed
 if [ ! -f "${TIMESTAMP_FILE}" ]; then
	TIMESTAMP=`find ${PROJECT_DIR}/Quale -printf '%T@\n' | sort -r | head -n 1`
	TIMESTAMP=`date -d @${TIMESTAMP} +%y%m%d%H%M.%S`
	touch -t ${TIMESTAMP} "${TIMESTAMP_FILE}"
	echo For Files changed since ${TIMESTAMP}
fi

 if [ -f "${DELTA_FILE}" ]; then
     rm ${DELTA_FILE}
 fi
 

#once of only call from server while [[ true ]] ; do
 
  # Identify updates by comparison with the reference timestamp file.
  UPDATES=`find ${MONITOR[*]} -type f -newer ${TIMESTAMP_FILE}`
 
  if [[ "${UPDATES}" ]] ; then
    echo .
	date
	#make a slight delay so if the editor did a "save all" we are likely to catch them in one go
	sleep 1   
	
	# take the time stamp before we search, so if any other files are changed after we visit them 
	# but before the loop is done they will be picked up as changed in the next loop.
	# conversely if a file is changed twice (once before, and then after ) it will be compiled twice	
	TIMESTAMP=`date +%y%m%d%H%M.%S`
	find ${MONITOR[*]} -type f -newer ${TIMESTAMP_FILE} > ${DELTA_FILE}

	#update the stamp
	touch -t ${TIMESTAMP} "${TIMESTAMP_FILE}"	
	
	#give some feedback
	cat ${DELTA_FILE} 	
	
	#execute the compiler    
	node  $COMPILER_DIR/compile.js deltafile ${DELTA_FILE} 
    
    
  fi
#  sleep ${INTERVAL_SECONDS}
#done

else
    echo rebuilding 
	
	sql-mvc patch

	rm -r  ${PROJECT_DIR}/output  2> /dev/null	 
	find ${MONITOR[*]} -type f -name Index.quicc > ${DELTA_FILE}

	#give some feedback
	cat ${DELTA_FILE} 	

	#execute the compiler
	
	#pushd ${PROJECT_DIR}/server/compiler
	pwd
	#node compile.js deltafile ${DELTA_FILE} 
	node $COMPILER_DIR/compile.js deltafile ${DELTA_FILE} 

	#touch $PROJECT_DIR/output/built_complete   

	diff output/Home/Guest/Index.sql ../Index.sql
	diff output/Home/User/Index.sql ../UserIndex.sql
	diff output/Home/Guest/Dashboard/Dashboard.sql ../Dashboard.sql


	
fi

  
) 200>${FLOCK_FILE}

#eof
