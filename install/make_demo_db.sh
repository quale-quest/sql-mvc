#!/bin/bash
source  /etc/firebird/2.5/SYSDBA.password
export ISC_USER=$ISC_USER
export ISC_PASSWORD=$ISC_PASSWORD
var=`node -pe "JSON.parse(require('fs').readFileSync('../Quale/Config/config.json').toString()).db.database"`
server=`node -pe "JSON.parse(require('fs').readFileSync('../Quale/Config/config.json').toString()).db.server"`

mkdir /var/db
chmod 777 /var/db

echo "CREATE DATABASE '$server:$var' page_size 16384 ;" | isql-fb
isql-fb  "$server:$var"  -i demo_db_dll.sql
isql-fb  "$server:$var"  -i demo_db_defaults.sql

ls /var/db -l
