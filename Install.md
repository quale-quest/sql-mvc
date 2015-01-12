
#Linux (ubuntu 14):
**Instructions for other OS'es to follow - but you get the idea.**
[Install-windows here](https://github.com/quale-quest/sql-mvc/blob/master/Install-windows.md)


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
git clone https://github.com/quale-quest/sql-mvc.git 
cd sql-mvc   
npm install


#the default config will:
#    place the database in /var/db 
#    attempt to update the current database
#    run dev server on port 3000
# to edit the default config :
nano ../Quale/Config/config.json

#now build the demo
chmod -R +x server/compiler/*.sh
chmod -R +x install/*.sh
cd install
./patch.sh
./make_udf.sh

./make_app.sh
```

#start sql-mvc server in dev mode
```
cd ..
bash dev_server.sh
```
#Enjoy
Open our browser to localhost:3000 and view the demo app

Edit and play with the demo page : sql-mvc/Quale/Standard/Home/Guest/Dashboard/Dashboard-Include.quicc
the changes you make will automatically be updated to your browser.

Error output will bve on the console running the ./dev_server.sh
and also in the file: sql-mvc/server/compiler/output/error_log.json


#Production
This is not yet production ready, but FYI.
edit  ./run_web.sh  (fixing the absolute path)
edit crontab and add the line form install/crontab-e.md


#Manuals
Programmers Manual at https://github.com/quale-quest/sql-mvc/wiki


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


