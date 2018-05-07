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
		
		
		https://support.rackspace.com/how-to/installing-mysql-server-on-ubuntu/
		https://www.techrepublic.com/article/how-to-set-up-mysql-for-remote-access-on-ubuntu-server-16-04/
		
		sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf [mysqld]
		  add->  sql_mode = "NO_ZERO_DATE"
		  sudo service mysql restart
		
		CREATE DATABASE demo_db_2;
		INSERT INTO mysql.user (User,Host,authentication_string,ssl_cipher,x509_issuer,x509_subject)
		FLUSH PRIVILEGES;
		SELECT User, Host, authentication_string FROM mysql.user;
		GRANT ALL PRIVILEGES ON demodb.* to demouser@localhost;
--		GRANT ALL ON mysql.* TO 'demouser'@'192.168.177.1' IDENTIFIED BY '%u#098Tl3' WITH GRANT OPTION;
		GRANT ALL ON mysql.* TO 'root'@'192.168.177.1' IDENTIFIED BY 'zxpabx' WITH GRANT OPTION;
		GRANT ALL ON demo_db_2.* TO 'root'@'192.168.177.1' IDENTIFIED BY 'zxpabx' WITH GRANT OPTION;
		


	 
## Quick tips for sql	 

Let's see the list of locked tables mysql> show open tables where in_use>0;
Let's see the list of the current processes, one of them is locking your table(s) mysql> show processlist;
4) Kill one of these processes mysql> kill <put_process_id_here>;


## debuggin procedures
* https://dev.mysql.com/doc/refman/5.7/en/stored-routines.html  - check comments			 







## TODO

* mysql documentation
* fake_domains
* simple translations

