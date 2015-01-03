#!/bin/bash
cd /root/sql-mvc
mkdir /var/log/sql-mvc/ -p
/usr/local/bin/forever -o /var/log/sql-mvc/out.log -e /var/log/sql-mvc/err.log --workingDir /root/sql-mvc/ start -c /usr/local/bin/node /root/sql-mvc/app.js -p 80


