#!/bin/bash

read -p "When running this script, if prompted for [more] or password, press the enter key, like now...[more]"


DEBIAN_FRONTEND=noninteractive sudo apt-get install -y  -qq  firebird2.5-classic firebird-dev
sudo service firebird2.5-classic start
sudo chmod o+r /etc/firebird/2.5/SYSDBA.password

node server/compiler/compile.js app Home/Guest all


echo you can now run :
#pwd ==/home/ubuntu/workspace/node_modules/sql-mvc
echo cd node_modules/sql-mvc/;node app.js


#ln Quale/Standard/Home/Guest/Index.quicc ../../Index.quicc -s
#ln node_modules/sql-mvc/Quale/Standard/Home/Guest/Controllers/TodoController.quicc TodoController.quicc -s
#ln node_modules/sql-mvc/Quale/Standard/Home/Guest/Models/TodoModel.quicc TodoModel.quicc -s

#node app.js


