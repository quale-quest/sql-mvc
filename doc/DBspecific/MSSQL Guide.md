# MSSQL Guide,

## SQL Standards
say something ...


## SQL variations
say something

* MS SQL before version 2012 - does not have a convenient Limit Skip function - 2012 or later-  syntax OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;
* Triggers are not per record - the trigger fires once per statement, and the pseudo table Inserted might contain multiple rows.
	https://stackoverflow.com/questions/3580123/how-can-i-edit-values-of-an-insert-in-a-trigger-on-sql-server

* upsert a big problem
	http://michaeljswart.com/2017/07/sql-server-upsert-patterns-and-antipatterns/	
	

* SELECT * FROM sys.sequences

* Triggers
SELECT sysobjects.name AS trigger_name,OBJECT_NAME(parent_obj) AS table_name,OBJECT_DEFINITION(id) AS trigger_definition FROM sysobjects WHERE sysobjects.type = 'TR' 


delete from Z$PK_CACHE
delete from Z$VARIABLES
delete from sqlmvc."Z$CONTEXT"
delete from sqlmvc.TODO_MVC
select * from Z$PK_CACHE
select * from Z$VARIABLES
select * from Z$CONTEXT
select * from TODO_MVC
	
## indexes



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
		-- Qua1epassword!
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
		
		
		
		sqlcmd -S localhost -U SA -P Qua1epassword! -Q 'select @@VERSION'
		
## setup database and user  - MUST set default user schema		
		sqlcmd -S localhost -U SA -P Qua1epassword! -Q 'CREATE DATABASE demo_db_2' ;
		sqlcmd -S localhost -U SA -P Qua1epassword! -d demo_db_2 -Q 'CREATE DATABASE demo_db_2' ;
		
		sqlcmd -S localhost -U SA -P Qua1epassword! -d demo_db_2 -Q "CREATE LOGIN sqlmvc WITH PASSWORD = 'Qua1epassword';"
		sqlcmd -S localhost -U SA -P Qua1epassword! -d demo_db_2 -Q 'select name from master.sys.server_principals'
		sqlcmd -S localhost -U SA -P Qua1epassword! -d demo_db_2 -Q 'CREATE USER sqlmvc FOR LOGIN sqlmvc;'
		sqlcmd -S localhost -U SA -P Qua1epassword! -d demo_db_2 -Q 'GRANT ALTER To sqlmvc'
		sqlcmd -S localhost -U SA -P Qua1epassword! -d demo_db_2 -Q 'GRANT CONTROL To sqlmvc;'
		sqlcmd -S localhost -U SA -P Qua1epassword! -d demo_db_2 -Q 'create schema sqlmvc'
		sqlcmd -S localhost -U SA -P Qua1epassword! -d demo_db_2 -Q 'ALTER USER sqlmvc WITH DEFAULT_SCHEMA = sqlmvc'
		
		

	 
## Quick tips for sql	 
* check triggers:   SELECT * FROM sys.sequences


## debugging procedures





## TODO
* create domain: in future use create type and create default - now usinf fake doamin
* ALTER TABLE MAIL Alter REF DROP DEFAULT need a complex procedure to do this! // https://stackoverflow.com/questions/1364526/how-do-you-drop-a-default-value-from-a-column-in-a-table
CREATE\s+SEQUENCE


*Concurrency: As only one request at a time may be executed on a connection, another request should not be initiated until this callback is called. http://code.playvue.com/c9/node_modules/tedious/site/api-connection.html#function_beginTransaction
* var ConnectionPool = require('tedious-connection-pool');

## Notes

DELIMITER //
DROP TRIGGER IF EXISTS trgGallery //
CREATE TRIGGER  trgGallery
    ON GALLERY 
    INSTEAD OF INSERT
AS 
BEGIN
 	 DECLARE @original_query VARCHAR(1024);
    SET NOCOUNT ON;
    
 
    select * into #tmp from inserted;
    UPDATE #tmp SET Ref = (NEXT VALUE FOR  testseq  ) where Ref is null;
    -- insert into DEBUG(msg)  select * from #tmp;
    insert into GALLERY select * from #tmp;
    insert into DEBUG(msg) select name from inserted;
    -- drop table #tmp;
END //

DELIMITER ;





DELIMITER //
insert into GALLERY(name) values ('pabc1234'); //
select * from debug;//
select * from GALLERY;//
DELIMITER ;

DELIMITER //
delete  from debug//
delete  from GALLERY//
DELIMITER ;


