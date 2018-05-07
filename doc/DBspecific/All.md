# All,

## SQL Standards

https://www.eversql.com/most-popular-databases-in-2017-according-to-stackoverflow-survey/
	1 MySQL      44%
	2 SQL Server 30% - aka MSSQL
	3 PostGre	   23%
	4 SQLite     21%	
	5 Oracle     13%  //Oracle users my simply not use stack overflow so it could be top which would match db-engines
	
	https://db-engines.com/en/ranking/relational+dbms
	1 Oracle		1290
	2 MySQL			1223
	3 SQL Server	1085
	4 PostGre		 400
	6 SQLite		 115
	17 Firebird		  18
	69 NuoDB		0.81
	
	
	
	
	
	
	
	
## Standards
*	https://en.wikipedia.org/wiki/Select_(SQL)
	
	
	
## Quale compatibility enhancements
A set of convenience enhancements(syntactic sugar) that Quale will translate to the specific database.


Aggregate function: List 	Quale:list fb:List	MYSQL:GROUP_CONCAT() Oracle:LISTAGG		
Limit 1 Skip 10				MySQL:
INSERT MATCHING ;  -- a ddl enhancement 
CREATE DOMAIN 				for mysql create "fake_domain" replace the domains with normal mysql
SET TERM ^ ; // SET TERM ; ^  : Equivament to Delimiter $$ in mysql
GROUP_CONCAT
	
	
## Summery
* xxx



## Common re translations
SQL-MVC was written based on Firebird SQL, and primary development still occurs on Firebird SQL.
The base demo app should compile from a single source, the objective is to allow as much compatible code as possible to be translated to the specific database driver.
The base will contain at least one example of db specific code .

* Comments --
* basic compatable functions len length octet_length
* update or insert ..matching
* MAXDATE '2030/01/01'
* Limit 1 -> First 1

## dialect Directive 
syntax  : dialect()   - all dialects
syntax  : dialect([mysql,][!mysql53,][>mysql50,][<mysql80,])   - if str is in the active dialect, or if it is not in the dialect, or less or more than the version number


	
	
## online tools	
http://sqlfiddle.com	

## how to debug/dev
look at output folder
input.sql give a lot of info
runtime_exception allows you to resubmit the failed query via flamerobin




===one file
/home/xie01/sql/sql-mvc/Quale/Standard/Home/Guest/Index.quicc
 node server/compiler/compile.js index /Quale/Standard/Home/Guest/Index.quicc	
	
	
/home/xie01/sql/sql-mvc/Quale/Standard/Home/Guest/Index.quicc
/home/xie01/sql/sql-mvc/Quale/Standard/Home/User/Index.quicc
	
	
node server/compiler/compile.js file /home/xie01/sql/sql-mvc/Quale/Standard/Home/Guest/Index.quicc	
node server/compiler/compile.js file /home/xie01/sql/sql-mvc/Quale/Standard/Home/User/Index.quicc


node server/compiler/compile.js deltafile /tmp/file-monitor-delta.txt



## TODO

* More

