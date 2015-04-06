# SQL-MVC

**Paradigm inversion - write web applications in SQL instead of JavaScript.**

If you find the way web app development is done today as tedious, and wasteful, then join me 
in creating a true "application programming language" (or DSL of you prefer),
as opposed to using a general purpose language (JavaScript) for writing applications.

I have been a programmer since 1983 (mostly in embedded systems),
since 1999 I have been using my own secret platform to do the occasional custom line of business web app.
Last year (2014) I had a need to write a simple app for an embedded ARM processor (BeagleBone Black), and as my 
secret platform was windows only, I had to evaluate and choose from the latest app development technologies, 
I was quite amazed that app development seems to be less efficient now that back in the 90's.

So I started this project to modernize my secret methods, and make them available to the public.
These methods were developed in isolation, as a result SQL-MVC is quite different to anything else out there, 
so don't have preconceived notions, and don't limit your thinking by 
applying your current paradigm's best practices to SQL-MVC as it is a
complete rethink of the development stack. 
 
This is not a toy,it is under full-time active development, with the objective to match and beat any other technologies hands down.
 
In 1991 Oracle added a few extensions to SQL to create Procedural SQL, so now we have added a 
few more extensions to SQL, to create QUery Application Language Extensions (QUALE) - it is that simple.

**Recent change log: Divout popup, Automatic JIT compiler, Windows Installer and dev environment with syntax highlighting.**


Please join our new group to comment or discuss the technology( https://groups.google.com/group/sql-mvc-talk )

*Alpha version 0.0 Notice: When evaluating SQL-MVC keep in mind this project is still version 0.0.x- alpha/preview release.
The GUI looks old and clunky, but it is fully customisable and will be modernised, a lot of stuff is not 100% polished or even to spec,
try and pick up the key points we are trying to demonstrate not shortcomings or bugs
 (although all feedback is welcome). We expect to reach Beta version in April/May *
 
 
## Example	

This is a complete implementation of [todomvc.com](http://todomvc.com) functionality in 40 lines of code.
Prerequisite knowledge : SQL,JSON and [mustache](https://mustache.github.io/mustache.5.html).

Live Demo at [todomvc.sql-mvc.com](http://todomvc.sql-mvc.com/) 

```
<#model
CREATE TABLE TODO_MVC				--:{as:"Table"} 
(
  REF VARCHAR(40),					--:{as:"pk"}
  NAME VARCHAR(100),				--:{as:"Text",size:40,title:"todo",onupdate:"owner=session.id"}  
  OWNER VARCHAR(40),				--:{Type:"Hide"}
  STATUS VARCHAR(10) default ''    	--:{Type:"Pick",List:"Ticked",onupdate:"owner=session.id"}  
);#>

<#controller(todo.clear.button)
button(title:"Clear Completed",if:"(select count(ref) from todo_mvc where owner=session.id and status='1')!=0" )
sql update todo_mvc set status='3' where owner=session.id and (status='1');#>

<#controller(todo.itemcount)
ifquery ((select count(ref) from todo_mvc where owner=session.id and (status='' or status is null))!=1)
print () ($select count(*) from todo_mvc where owner=session.id and (status='' or status is null) $) items left
elsequery
print () ($select count(*) from todo_mvc where owner=session.id and (status='' or status is null) $) item left
endquery#>

<#view
table()
	Select  --:{Title:"Make new records",from:TODO_MVC,autoinsert:top,tablestyle:Todo}
	STATUS, --:{Action:Edit,debug:0,autosave:yes}
	NAME,   --:{Action:Edit,placeholder:"What needs to be done (tab to save)",autosave:yes}
	REF	    --:{Action:View,Type:Hide}
	From TODO_MVC 
	where (owner=session.id and ( (here.todo_type='' and (status!='3' or status is null)) 
	or( (status='' or status is null) and here.todo_type='1')or(status='1' and here.todo_type='2')))

use(todo.itemcount)

button(title:"View all") set here.todo_type='';

button(title:"Active")   set here.todo_type='1';

button(title:"Completed") set here.todo_type='2';

use(todo.clear.button)
#>
```


## SQL-MVC Getting_Started,

* Windows - [Windows install](https://github.com/quale-quest/sql-mvc-winstaller/blob/master/README.md)
* Cloud 9 IDE - [Quick and easy to get going](https://github.com/quale-quest/sql-mvc-c9/blob/master/README.md)
* Existing node environment - in a fresh project directory just do:   **npm install sql-mvc**
* Install instructions for Linux VPS from scratch - [Install.md](https://github.com/quale-quest/sql-mvc/blob/master/doc/Install-linux.md)


## Tutorials at :

[Tutorials.md](https://github.com/quale-quest/sql-mvc/blob/master/doc/Tutorials.md)
 
## Programmers Manual at : 

[Github - wiki](https://github.com/quale-quest/sql-mvc/wiki)






## Developer Resources

* Git hub https://github.com/quale-quest/sql-mvc
* SQL-MVC help and discussion mailing list: https://groups.google.com/group/sql-mvc-talk


## How does SQL-MVC work?

* The compiler takes your application code which is little more 
than a few SQL statements, directives and properties and produces:
  1. All the database code as a single stored procedure, to be run to produce JSON output.
  2. a Moustache Template(Hogan) containing all the client side code to be filled with the JSON.
When the two are combined in the browser !!voila!!.
* The server node.js does very little other than pass JSON between the server and client.
* All the business logic remains in the database server.
* You have full control of the client side look, feel and behaviour, the 
default framework and theme is just to give you a quick start.

### Super fast Development:	

* Write web applications with little more than a few SQL statements
* DRY (don't repeat yourself), Inheritance, Auto-Menus and more further reduces development time.
* Drop-in and plug-in modules allow easy use and customisation of common application functionality.
* Quick start with Platform + Framework + Themes + Modules + Demo's 
* Build easily reusable custom widgets from complex HTML/JS/JQ
* Consistently customise the look and feel of your application widgets.	
* Automatic hot code push during development (no reloading of pages with F5)
* i18n support and tools
* Security implied by design rather than explicit configuration.

### Super fast Runtime:

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

### Other features

* Windows installer and development environment with JIT compiler and notepad++ with syntax highlighting.
* Database drivers available for Firebird SQL, support planned for : MySQL, SQL Server, Oracle, NuoDB.
* Planned support for JavaScript stored procedure engine, to enable no-sql, sqlite and off-line applications.



## Licensing

SQL-MVC is a commercial open source project, It is free as in speech
but not free as in beer, but cheap as in peanuts.

 
