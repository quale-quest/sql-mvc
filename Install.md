
#npm Linux (ubuntu 14):
**Instructions for other OS'es to follow - but you get the idea.**
[Install-windows here](https://github.com/quale-quest/sql-mvc/blob/master/Install-windows.md)
[Install-linux from git here](https://github.com/quale-quest/sql-mvc/blob/master/doc/Install-git.md)


sudo su # if you are not already root   

Skip what you already have or don't need.    

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


#sql-mvc from npm

```
sudo npm install sql-mvc -g
sql-mvc new demo-app
cd demo-app
npm install
sql-mvc patch

#the default config will:
#    place the database in /var/db 
#    it will attempt to update or create the database
#    run dev server on port 3000
#to edit the default config :
nano ../Quale/Config/config.json  #customise what you need
node app.js   # it will say "compiler busy " for a few seconds while it builds the app and demo db
```

#Enjoy
Open our browser to localhost:3000 and view the demo app

Edit and play with the demo page : /Quale/Standard/Home/Guest/Dashboard/Dashboard-Include.quicc
the changes you make will automatically be updated to your browser.

Compiler error output can be viewd by pressing ctrl-q in the application page.
And it will be on the console running the ./dev_server.sh
and also in the file: output/error_log.json


#Production
This is not yet production ready, but FYI.
Edit the config.json (set server port etc..)

>sql-mvc forevere path_to_your_project_root


or edit crontab and add the line :
>@reboot /usr/local/bin/sql-mvc forevere path_to_your_project_root

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


