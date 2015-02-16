#!/bin/bash

sudo apt-get install -y build-essential sudo curl git nano unzip tcl python
sudo apt-get install -y firebird2.5-classic firebird-dev
sudo service firebird2.5-classic start
sudo ln -s /home/ubuntu/.nvm/v0.10.35/bin/node /usr/bin/nodejs

npm install -g socketstream
npm install -g sql-mvc

sql-mvc new demo-app c9
cd demo-app
npm install
sql-mvc patch

#sudo nano ../Quale/Config/config.json   8080
sudo mkdir /var/db
sudo chown firebird:firebird /var/db

#run the server app	
sudo ./check.sh

echo now run : sudo node app.js