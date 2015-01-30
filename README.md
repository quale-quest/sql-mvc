# SQL-MVC

**Paradigm inversion - write web applications in SQL instead of JavaScript.**

##Example	
This is a complete implementation of [todomvc.com](http://todomvc.com) functionality in 40 lines of code.
Prerequisite knowledge : SQL,JSON,Regex and [mustache](https://mustache.github.io/mustache.5.html).

Live Demo at http://todomvc.sql-mvc.com/, 

```
<#:model
--:{regex:"regex:/varchar/i",autosave:yes}
CREATE TABLE TODO_MVC				--:{as:"Table"} 
(
  REF VARCHAR(40),					--:{as:"pk"}
  NAME VARCHAR(100),	--:{as:"Text",size:40,title:"todo",onupdate:"owner=session.id"}  
  OWNER VARCHAR(40),				--:{Type:"Hide"}
  STATUS VARCHAR(10) default ''		--:{Type:"Pick",List:"Ticked"}  
);
/>

<#:table
Select  --:{from:"TODO_MVC",autoinsert:"top",tablestyle:"Todo"}
STATUS, --:{Action:"Edit"}
NAME,   --:{Action:"Edit","placeholder":"What needs to be done"}
REF	    --:{Action:"View",Type:"Hide"}
From TODO_MVC 
where (owner=session.id and ( (my.todo_type='' and status!='3' ) 
or( status='' and my.todo_type='1')or(status='1' and my.todo_type='2')))
/>
<#:print 
--{if:"(select count(ref) from todo_mvc where owner=session.id and status='')!=1" }
($select count(*) from todo_mvc where owner=session.id and status='') $)
items left
/>
<#:print 
--{if:"(select count(ref) from todo_mvc where owner=session.id and status='')=1" }
($select count(*) from todo_mvc where owner=session.id and status='' $)
item left
/>
<#:button --{title:"all"}
set my.todo_type='';
/>
<#:button --{title:"Active"}
set my.todo_type='1';
/>
<#:button --{title:"Completed"}
set my.todo_type='2';
/>
<#:button
--{title:"Clear Completed",if:"(select count(ref) from todo_mvc where owner=session.id and status='1')!=0" }
sql update todo_mvc set status='3' where owner=session.id and (status='1');
/>
```

##How does SQL-MVC work?
* The compiler takes your application code which is little more 
than a few SQL statements, directives and properties and produces:
  1. All the database code as a single stored procedure, to be run to produce JSON output.
  2. a Moustache Template(Hogan) containing all the client side code to be filled with the JSON.
When the two are combined in the browser !!voila!!.
* The server node.js does very little other than pass JSON between the server and client.
* All the business logic remains in the database server.
* You have full control of the client side look, feel and behaviour, the 
default framework and theme is just to give you a quicc start.

###Super fast Development:	
* Write web applications with little more than a few SQL statements
* DRY (don't repeat yourself), Inheritance, Auto-Menus and more further reduces development time.
* Drop-in and plug-in modules allow easy use and customisation of common application functionality.
* Quick start with Platform + Framework + Themes + Modules + Demo's 
* Build easily reusable custom widgets from complex HTML/JS/JQ
* Consistently customise the look and feel of your application widgets.	
* Automatic hot code push during development (no reloading of pages with F5)
* i18n support and tools
* Security implied by design rather than explicit configuration.

###Super fast Runtime:
* All database queries are amalgamated into a single database stored procedure call. 
* the JSON from the database is retrieved in one BLOB (Less chatter to the DB).
* Almost no middle-ware processing.	
* Exchange only JSON data elements across the wire.	
* Build with Nodejs, SocketStream and Hogan templates to produce Single Page Applications.	
* The page loads full visible content on first load - no partial view like waiting for multiple Ajax /ReST calls.
* Lazy loading of application client code while the user keys in his login information( if not cached already).
* Partial div(Divout) / records load/reload  on Navigating / Saving or refreshing content.
* Lazy loading of obscured views or obscured rows in large data sets
* Client side caching of large datasets in reusable/relocatable chunks
* Subscribe to events to do partial refreshes when changes are posted to database objects by other users.

###Other features
* Database drivers available for Firebird SQL, support planned for : MySQL, SQL Server, Oracle, NuoDB.
* Planned support for JavaScript stored procedure engine, to enable no-sql, sqlite and off-line applications.


## Getting Started
Install instructions at : [Github - Install.md](https://github.com/quale-quest/sql-mvc/blob/master/Install.md)

Programmers Manual at : [Github - wiki](https://github.com/quale-quest/sql-mvc/wiki)

## Developer Resources

Building an application with SQL-MVC?

* Announcement list: sign up at http://www.sql-mvc.com/
* Ask a question: http://stackoverflow.com/questions/tagged/sql-mvc
* SQL-MVC help and discussion mailing list: https://groups.google.com/group/sql-mvc-talk
* Git hub https://github.com/quale-quest/sql-mvc

Interested in contributing to SQL-MVC?

* Core platform & framework design mailing list: https://groups.google.com/group/sql-mvc-core
* Contribution guidelines: https://github.com/sql-mvc/tree/devel/Contributing.md


## Licensing
SQL-MVC is a commercial open source project, It is free as in speech
but not free as in beer, but cheap as in peanuts.

	
## Alpha version 0.0.1 Notice: 
When evaluating SQL-MVC keep in mind this project is still version 0.0.x- alpha/preview  
release - a lot of stuff is not 100% polished or even to spec,
try and pick up the key points we are trying to demonstrate not shortcomings or bugs
 (although all feedback is welcome).
 
