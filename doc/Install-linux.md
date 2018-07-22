
#Install Debian/Ubuntu from scratch with npm :

Skip what you already have or don't need.    

	sudo su # if you are not already root   



#basics
	apt-get update
	apt-get upgrade
	apt-get install -y build-essential sudo curl git nano unzip tcl python
	apt-get install -y fail2ban


#node.js

Install node version 9.11.0 according to your distro

	curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
	sudo apt-get install -y nodejs
	sudo apt-get install -y build-essential
	npm install -g forever


#sql-mvc from npm

    mkdir  myapp;cd myapp
    npm install sql-mvc	
	node --es_staging  node_modules/sql-mvc/bin/sql-mvc.js patch
	node node_modules/sql-mvc/bin/sql-mvc.js new app
	cd app
	npm install
	node --es_staging  ../node_modules/sql-mvc/bin/sql-mvc.js patch
	./check.sh
	node app.js
	
    

#Enjoy
Open our browser to localhost:3000 and view the demo app

The app sits under node_modules/sql-mvc.

Edit and play with the demo page : /Quale/Standard/Home/Guest/Index.quicc
the changes you make will automatically be updated to your browser.

Compiler error output can be viewed by pressing ctrl-q in the application page.
And it will be on the console running the server
and also in the file: output/error_log.json


#Production
This is not yet production ready, but FYI.

	cd myapp
	touch production.run 
	node node_modules/sql-mvc/bin/sql-mvc  forever node_modules/sql-mvc/

edit crontab and add the line :

	@reboot node PATH_TO_MYAPP/node_modules/sql-mvc/bin/sql-mvc  forever PATH_TO_MYAPP/node_modules/sql-mvc/

#Manuals
Programmers Manual at https://github.com/quale-quest/sql-mvc/wiki


#Feedback
Please let me know if this works....

Post messages to 

SQL-MVC help and discussion mailing list: https://groups.google.com/group/sql-mvc-talk

Git hub https://github.com/quale-quest/sql-mvc


Thanks


