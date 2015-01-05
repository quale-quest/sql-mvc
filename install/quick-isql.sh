#!/bin/bash
source  /etc/firebird/2.5/SYSDBA.password
export ISC_USER=$ISC_USER
export ISC_PASSWORD=$ISC_PASSWORD
var=`node -pe "JSON.parse(require('fs').readFileSync('../Quale/Config/config.json').toString()).db.database"`
server=`node -pe "JSON.parse(require('fs').readFileSync('../Quale/Config/config.json').toString()).db.server"`


echo db: $var
echo press crtl-d to exit, or help; 
isql-fb  "$server:$var" -i quick-isql.sql

