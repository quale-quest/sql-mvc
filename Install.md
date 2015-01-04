
#Linux (ubuntu 14):
**Instructions for other OS'es to follow - but you get the idea.**
*Windows will have issues with bash scripts and compiled UDF but instructions will follow.*

sudo su # if you are not already root       

#basics
```
apt-get update
apt-get upgrade
apt-get install -y build-essential sudo curl git nano unzip tcl python
apt-get install -y fail2ban
```

#database servers
##Firebird
```
apt-get install -y firebird2.5-classic firebird-dev  **just press enter on the password prompt**
service firebird2.5-classic start
```

##Redis
```
[#ref:](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-redis)
wget http://download.redis.io/releases/redis-2.8.9.tar.gz
tar xzf redis*
cd redis*
make & make install         **press enter on pause after hint**
cd ~
```

#node.js
```
curl -sL https://deb.nodesource.com/setup | sudo bash -
apt-get install -y nodejs
sudo npm cache clean -f
sudo npm install -g n
sudo n latest
npm install  -g node-gyp
npm install -g socketstream
npm install -g forever
```

#sql-mvc
```
mkdir & cd where you want to install
npm install sql-mvc   

#I have to create a project installer- like socket-sream - for now just do:
mv node_modules/sql-mvc/ .   
rm node_modules/  
cd sql-mvc/

#config is under Quale/Config/config.json  (database file name, server port etc.)
#note the data base will be placed in /var/db - to change it edit config.json


#now build the demo
chmod -R +x server/compiler/*.sh
chmod -R +x install/*.sh
cd install
./patch.sh
./make_udf.sh

#if you are reinstalling you will want to 
# skip the make_demo_db step (if db is unchanged) or
#   do a **rm  /var/db/demo_db.fdb**, 
#   or change the database name.
./make_demo_db.sh
./make_app.sh
```

#start sql-mvc server in dev mode
```
cd ..
bash dev_server.sh
```
#enjoy
Open our browser to localhost:3000 and view the demo app

Edit and play with the demo page : sql-mvc/Quale/Standard/Home/Guest/Dashboard/Dashboard-Include.quicc
the changes you make will automatically be updated to your browser.

Error output will bve on the consol running the ./dev_server.sh
and also in the file: sql-mvc/server/compiler/output/error_log.json


#production
This is not yet production ready, but FYI.
edit  ./run_web.sh  (fixing the absolute path)
edit crontab and add the line form install/crontab-e.md



#TODO / TO FOLLOW- Hot and Important
* have errors displayed in a "dev" window on the browser in a more readable format
* Tutorial
* Documentation



#Feedback
Please let me know if this works....

Post messages to 

SQL-MVC help and discussion mailing list: https://groups.google.com/group/sql-mvc-talk

Git hub https://github.com/quale-quest/sql-mvc
or you can email me directly lafras@xietel.com


Thanks


