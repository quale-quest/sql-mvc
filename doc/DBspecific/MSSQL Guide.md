# MSSQL Guide,

## SQL Standards
say something ...


## SQL variations
say something

* MS SQL before version 2012 - does not have a convenient Limit Skip function 
* 2012 or later-  syntax OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;


## indexes

	https://stackoverflow.com/questions/14383503/on-duplicate-key-update-same-as-insert	 

## Setup server
		
		https://docs.microsoft.com/en-us/sql/linux/sql-server-linux-setup?view=sql-server-linux-2017
		https://www.microsoft.com/en-us/sql-server/developer-get-started/node/ubuntu/
		
		apt-get install  curl
		apt install software-properties-common
		
		sudo curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
		sudo add-apt-repository "$(curl https://packages.microsoft.com/config/ubuntu/16.04/mssql-server-2017.list)"
		sudo apt-get update
		sudo apt-get install mssql-server
		
		
		sudo /opt/mssql/bin/mssql-conf setup
		--Qua1epassword!
		node -v
		
## setup SQLCMD
		curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
		curl https://packages.microsoft.com/config/ubuntu/16.04/prod.list | sudo tee /etc/apt/sources.list.d/mssql-tools.list
		sudo apt-get update
		sudo ACCEPT_EULA=Y apt-get install mssql-tools
		sudo apt-get install unixodbc-dev
		echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bash_profile
		echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc
		source ~/.bashrc
		
		
		
		sqlcmd -S localhost -U SA -Q 'select @@VERSION'
			
		
		

	 
## Quick tips for sql	 

Let's see the list of locked tables mysql> show open tables where in_use>0;
Let's see the list of the current processes, one of them is locking your table(s) mysql> show processlist;
4) Kill one of these processes mysql> kill <put_process_id_here>;


## debuggin procedures





## TODO


* domains 
* simple translations

